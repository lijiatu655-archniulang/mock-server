package com.xinyuan.village.modules.ai.rag;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xinyuan.village.config.AiProperties;
import com.xinyuan.village.modules.content.ContentMapper;
import com.xinyuan.village.modules.content.entity.CmsArticle;
import com.xinyuan.village.modules.gov.GovMapper;
import com.xinyuan.village.modules.gov.entity.GovItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * RAG 检索：文章正文 + 政务事项构造语料，内存 BM25 召回，返回可点击引用。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagService {

    private final ContentMapper contentMapper;
    private final GovMapper govMapper;
    private final ObjectMapper objectMapper;
    private final AiProperties props;

    private volatile Retriever retriever;

    public record RagResult(String context, List<Map<String, Object>> refs, int hitCount) {
        public static RagResult empty() {
            return new RagResult("", List.of(), 0);
        }
    }

    public RagResult retrieve(String question) {
        Retriever r = ensureIndex();
        if (r == null) return RagResult.empty();
        List<Retriever.Scored> hits = r.search(question, Math.max(props.getRag().getTopK() * 3, 9));
        List<Retriever.Scored> candidates = new ArrayList<>();
        for (Retriever.Scored h : hits) {
            if (h.score() >= props.getRag().getMinScore() && h.coverage() >= 0.3) candidates.add(h);
        }
        if (candidates.isEmpty()) return RagResult.empty();
        // 只保留与第一名分数接近的结果，避免“高龄补贴”带出值班表、就业证之类的弱相关文章
        double top = candidates.get(0).score();
        List<Retriever.Scored> kept = new ArrayList<>();
        for (Retriever.Scored h : candidates) {
            if (h.score() >= top * 0.65 && kept.size() < props.getRag().getTopK()) kept.add(h);
        }

        StringBuilder ctx = new StringBuilder();
        List<Map<String, Object>> refs = new ArrayList<>();
        Set<String> seenRef = new HashSet<>();
        int idx = 1;
        for (Retriever.Scored h : kept) {
            Chunk c = h.chunk();
            // 同一篇文章的不同段落都放进上下文（15 年缴费这类细节常在后半段），引用只保留一条
            ctx.append("[").append(idx++).append("] ").append(c.title()).append("：")
                    .append(abbreviate(c.text(), 600)).append("\n");
            if (seenRef.add(c.id())) refs.add(ref(c, h.score()));
        }
        return new RagResult(ctx.toString(), refs, refs.size());
    }

    private Map<String, Object> ref(Chunk c, double score) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", c.type());
        m.put("id", c.id());
        if ("article".equals(c.type())) m.put("articleId", c.id());
        m.put("title", c.title());
        m.put("source", c.source());
        m.put("snippet", abbreviate(c.text(), 60));
        m.put("route", c.route());
        m.put("score", Math.round(score * 100) / 100.0);
        return m;
    }

    private Retriever ensureIndex() {
        Retriever r = retriever;
        if (r != null) return r;
        synchronized (this) {
            if (retriever == null) {
                try {
                    retriever = new Retriever(buildCorpus());
                    log.info("RAG index built");
                } catch (Exception e) {
                    log.warn("RAG index build failed: {}", e.getMessage());
                    return null;
                }
            }
            return retriever;
        }
    }

    /** 语料是静态数据（无管理端），首次检索时构建一次即可 */
    public List<Chunk> buildCorpus() {
        List<Chunk> chunks = new ArrayList<>();
        List<CmsArticle> articles = contentMapper.allArticles();
        for (CmsArticle a : articles) {
            String plain = plain(a.getContent());
            if (plain.isEmpty()) plain = a.getSummary() == null ? "" : a.getSummary();
            List<String> parts = split(plain, 260);
            for (int i = 0; i < parts.size(); i++) {
                chunks.add(new Chunk(a.getId(), "article", a.getTitle(), parts.get(i),
                        "/pages/article/detail?id=" + a.getId(),
                        a.getSource() == null ? "新源村党群服务中心" : a.getSource()));
            }
        }
        List<GovItem> items = govMapper.items(null, null);
        for (GovItem item : items) {
            String text = itemText(item);
            List<String> parts = split(text, 420);
            for (int i = 0; i < parts.size(); i++) {
                chunks.add(new Chunk(item.getCode(), "item",
                        i == 0 ? item.getName() : item.getName() + "（续）",
                        parts.get(i), "/pages/gov/detail?code=" + item.getCode(),
                        "新源村政务服务事项库"));
            }
        }
        log.info("RAG corpus: articles={}, items={}, chunks={}", articles.size(), items.size(), chunks.size());
        return chunks;
    }

    private String itemText(GovItem i) {
        StringBuilder sb = new StringBuilder();
        sb.append("事项：").append(nvl(i.getName()));
        if (i.getShortName() != null && !i.getShortName().isBlank()) sb.append("（").append(i.getShortName()).append("）");
        sb.append("\n摘要：").append(nvl(i.getSummary()));
        sb.append("\n服务对象：").append(nvl(i.getTarget()));
        sb.append("\n办理条件：").append(flatten(i.getConditionsJson()));
        sb.append("\n所需材料：").append(flatten(i.getMaterials()));
        sb.append("\n办理流程：").append(flatten(i.getSteps()));
        sb.append("\n承诺时限：").append(i.getPromiseDays() == null ? "以窗口告知为准" : i.getPromiseDays() + " 个工作日");
        sb.append("\n费用：").append(nvl(i.getFee()));
        sb.append("\n咨询电话：").append(nvl(i.getPhone()));
        sb.append("\n办理地址：").append(nvl(i.getAddress()));
        sb.append("\n政策依据：").append(flatten(i.getBasis()));
        sb.append("\n常见问题：").append(flatten(i.getFaqs()));
        return sb.toString();
    }

    /** 把 JSON 数组/对象里的所有文本值拍平，避免为每个字段建实体类 */
    private String flatten(String json) {
        if (json == null || json.isBlank()) return "";
        try {
            JsonNode node = objectMapper.readTree(json);
            List<String> vals = new ArrayList<>();
            collect(node, vals);
            return String.join("；", vals);
        } catch (Exception e) {
            return json;
        }
    }

    private void collect(JsonNode node, List<String> out) {
        if (node == null) return;
        if (node.isTextual()) {
            String t = node.asText().trim();
            if (!t.isEmpty()) out.add(t);
        } else if (node.isArray()) {
            for (JsonNode n : node) collect(n, out);
        } else if (node.isObject()) {
            node.fields().forEachRemaining(e -> {
                if ("icon".equals(e.getKey()) || "tint".equals(e.getKey())) return;
                collect(e.getValue(), out);
            });
        }
    }

    static String plain(String html) {
        if (html == null) return "";
        String s = html.replaceAll("(?is)<(script|style)[^>]*>.*?</\\1>", " ");
        s = s.replaceAll("<[^>]+>", " ");
        s = s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<")
                .replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'");
        return s.replaceAll("\\s+", " ").trim();
    }

    static List<String> split(String text, int size) {
        List<String> out = new ArrayList<>();
        if (text == null || text.isBlank()) return out;
        String[] parts = text.split("(?<=[。！？；])");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (sb.length() + p.length() > size && sb.length() > 0) {
                out.add(sb.toString());
                sb.setLength(0);
            }
            if (p.length() > size) {
                for (int i = 0; i < p.length(); i += size) {
                    out.add(p.substring(i, Math.min(p.length(), i + size)));
                }
            } else {
                sb.append(p);
            }
        }
        if (sb.length() > 0) out.add(sb.toString());
        return out;
    }

    private static String abbreviate(String s, int max) {
        if (s == null) return "";
        String t = s.replaceAll("\\s+", " ").trim();
        return t.length() > max ? t.substring(0, max) + "…" : t;
    }

    private static String nvl(String s) {
        return s == null ? "" : s;
    }
}
