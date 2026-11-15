package com.xinyuan.village.modules.ai;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.config.AiProperties;
import com.xinyuan.village.modules.ai.entity.AiConversation;
import com.xinyuan.village.modules.ai.entity.AiMessage;
import com.xinyuan.village.modules.ai.entity.AiSuggestion;
import com.xinyuan.village.modules.ai.llm.LlmClient;
import com.xinyuan.village.modules.ai.llm.LlmMessage;
import com.xinyuan.village.modules.ai.rag.RagService;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.SystemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiMapper aiMapper;
    private final SystemMapper systemMapper;
    private final SystemService systemService;
    private final AnswerGenerator answerGenerator;
    private final LlmClient llmClient;
    private final RagService ragService;
    private final PromptBuilder promptBuilder;
    private final AiProperties aiProperties;

    public interface Sink {
        void send(String event, Object data) throws Exception;
    }

    public Map<String, Object> suggestions() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (AiSuggestion s : systemMapper.suggestions()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("text", s.getText());
            m.put("icon", s.getIcon());
            list.add(m);
        }
        Map<String, String> cfg = systemService.configMap();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("welcome", cfg.getOrDefault("aiWelcome", ""));
        m.put("disclaimer", cfg.getOrDefault("aiDisclaimer", ""));
        return m;
    }

    public AiConversation resolveConversation(String userId, String conversationId, String question) {
        if (conversationId != null && !conversationId.isBlank()) {
            AiConversation c = aiMapper.conversation(conversationId);
            if (c == null) throw new BizException(ErrorCode.PARAM_INVALID, "会话不存在或已删除");
            if (!c.getUserId().equals(userId)) throw new BizException(ErrorCode.FORBIDDEN);
            return c;
        }
        AiConversation c = new AiConversation();
        c.setId("cv" + IdUtil.getSnowflakeNextIdStr());
        c.setUserId(userId);
        c.setTitle(titleOf(question));
        aiMapper.insertConversation(c);
        return aiMapper.conversation(c.getId());
    }

    public String saveUserMessage(String conversationId, String userId, String question) {
        return saveMessage(conversationId, userId, "user", question, null, null);
    }

    public void touch(String conversationId) {
        aiMapper.touchConversation(conversationId);
    }

    /** 同步问答：大模型优先，失败/未启用时回退规则引擎 */
    public Map<String, Object> chat(String userId, String question, String conversationId) {
        if (question == null || question.isBlank()) {
            throw new BizException(ErrorCode.PARAM_INVALID, "请输入您的问题");
        }
        long start = System.currentTimeMillis();
        AiConversation conv = resolveConversation(userId, conversationId, question);
        List<AiMessage> history = aiMapper.messages(conv.getId());
        saveUserMessage(conv.getId(), userId, question);

        AnswerGenerator.Answer rule = answerGenerator.answerFor(question);
        RagService.RagResult rag = aiProperties.usable()
                ? ragService.retrieve(question) : RagService.RagResult.empty();

        String text = rule.text();
        boolean llmOk = false;
        if (aiProperties.usable()) {
            try {
                String answer = llmClient.chat(promptBuilder.build(question, rag, history,
                        aiProperties.getRag().getHistoryRounds()));
                if (answer != null && !answer.isBlank()) {
                    text = answer.trim();
                    llmOk = true;
                }
            } catch (Exception e) {
                log.warn("llm chat fallback to rules: {}", e.getMessage());
            }
        }

        List<Map<String, Object>> refs = llmOk ? rag.refs() : rule.refs();
        if (llmOk && refusal(text)) refs = List.of();
        List<String> followUps = rule.followUps() == null ? List.of() : rule.followUps();
        String messageId = saveMessage(conv.getId(), userId, "assistant", text,
                Json.write(refs), Json.write(followUps));
        touch(conv.getId());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("conversationId", conv.getId());
        m.put("messageId", messageId);
        m.put("question", question);
        m.put("answer", text);
        m.put("refs", refs);
        m.put("followUps", followUps);
        m.put("latencyMs", (int) (System.currentTimeMillis() - start));
        return m;
    }

    /**
     * 流式问答。事件顺序与契约一致：meta → delta×N → refs → done。
     * 大模型不可用或首字前失败时，自动回退到规则引擎，保证演示永远有回答。
     */
    public void streamChat(String userId, String question, String conversationId, Sink sink) throws Exception {
        if (question == null || question.isBlank()) {
            throw new BizException(ErrorCode.PARAM_INVALID, "请输入您的问题");
        }
        long start = System.currentTimeMillis();
        AiConversation conv = resolveConversation(userId, conversationId, question);
        List<AiMessage> history = aiMapper.messages(conv.getId());
        saveUserMessage(conv.getId(), userId, question);

        AnswerGenerator.Answer rule = answerGenerator.answerFor(question);
        RagService.RagResult rag = aiProperties.usable()
                ? ragService.retrieve(question) : RagService.RagResult.empty();
        List<Map<String, Object>> refs = aiProperties.usable() ? rag.refs() : rule.refs();

        // 先落一条空消息拿到真实 messageId，再发 meta（否则前端反馈会打到 pending）
        String messageId = saveMessage(conv.getId(), userId, "assistant", "", null, null);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("conversationId", conv.getId());
        meta.put("messageId", messageId);
        meta.put("intent", rule.intent());
        meta.put("needRefs", !refs.isEmpty());
        sink.send("meta", meta);

        StringBuilder buffer = new StringBuilder();
        boolean usedLlm = false;
        if (aiProperties.usable()) {
            boolean[] sent = {false};
            try {
                List<LlmMessage> messages = promptBuilder.build(question, rag, history,
                        aiProperties.getRag().getHistoryRounds());
                llmClient.chatStream(messages, delta -> {
                    buffer.append(delta);
                    sent[0] = true;
                    try {
                        sink.send("delta", Map.of("text", delta));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                });
                usedLlm = true;
            } catch (Exception e) {
                log.warn("llm stream failed (sentAny={}): {}", sent[0], e.getMessage());
                if (sent[0]) {
                    finishMessage(messageId, buffer.toString(), refs, rule.followUps());
                    throw e;
                }
                buffer.setLength(0);
            }
        }

        if (!usedLlm) {
            String text = rule.text();
            int step = 8;
            for (int i = 0; i < text.length(); i += step) {
                String chunk = text.substring(i, Math.min(text.length(), i + step));
                buffer.append(chunk);
                sink.send("delta", Map.of("text", chunk));
                Thread.sleep(18);
            }
            refs = rule.refs();
        }

        if (usedLlm && refusal(buffer.toString())) refs = List.of();
        List<String> followUps = rule.followUps() == null ? List.of() : rule.followUps();
        finishMessage(messageId, buffer.toString(), refs, followUps);
        touch(conv.getId());

        if (!refs.isEmpty()) sink.send("refs", Map.of("refs", refs));

        Map<String, Object> done = new LinkedHashMap<>();
        done.put("conversationId", conv.getId());
        done.put("messageId", messageId);
        done.put("latencyMs", (int) (System.currentTimeMillis() - start));
        done.put("followUps", followUps);
        sink.send("done", done);
    }

    private void finishMessage(String id, String content, List<Map<String, Object>> refs, List<String> followUps) {
        aiMapper.finishMessage(id, content, Json.write(refs), Json.write(followUps));
    }

    private String saveMessage(String conversationId, String userId, String role, String content,
                               String refs, String followUps) {
        AiMessage m = new AiMessage();
        m.setId("m" + IdUtil.getSnowflakeNextIdStr());
        m.setConversationId(conversationId);
        m.setUserId(userId);
        m.setRole(role);
        m.setContent(content);
        m.setRefs(refs);
        m.setFollowUps(followUps);
        aiMapper.insertMessage(m);
        return m.getId();
    }

    public Map<String, Object> conversations(String userId, int page, int pageSize) {
        int p = Math.max(1, page);
        int size = Math.min(Math.max(1, pageSize), 50);
        long total = aiMapper.countConversations(userId);
        List<Map<String, Object>> list = new ArrayList<>();
        for (AiConversation c : aiMapper.conversations(userId, (p - 1) * size, size)) {
            List<AiMessage> msgs = aiMapper.messages(c.getId());
            String last = "";
            for (int i = msgs.size() - 1; i >= 0; i--) {
                if ("assistant".equals(msgs.get(i).getRole())) {
                    last = msgs.get(i).getContent();
                    break;
                }
            }
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("title", c.getTitle());
            m.put("createdAt", Times.minute(c.getCreatedAt()));
            m.put("updatedAt", Times.minute(c.getUpdatedAt()));
            m.put("messageCount", msgs.size());
            m.put("lastMessage", last);
            list.add(m);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", total);
        m.put("page", p);
        m.put("pageSize", size);
        return m;
    }

    public Map<String, Object> messages(String userId, String conversationId, int page, int pageSize) {
        AiConversation c = aiMapper.conversation(conversationId);
        if (c == null) throw new BizException(ErrorCode.PARAM_INVALID, "会话不存在或已删除");
        if (!c.getUserId().equals(userId)) throw new BizException(ErrorCode.FORBIDDEN);
        int p = Math.max(1, page);
        int size = Math.min(Math.max(1, pageSize), 50);
        List<Map<String, Object>> list = new ArrayList<>();
        for (AiMessage msg : aiMapper.messages(conversationId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", msg.getId());
            m.put("role", msg.getRole());
            m.put("content", msg.getContent());
            m.put("refs", Json.parse(msg.getRefs()));
            m.put("followUps", Json.parse(msg.getFollowUps()));
            m.put("feedback", msg.getFeedback() == null ? "" : msg.getFeedback());
            m.put("createdAt", Times.minute(msg.getCreatedAt()));
            list.add(m);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("conversationId", conversationId);
        m.put("list", list);
        m.put("total", list.size());
        m.put("page", p);
        m.put("pageSize", size);
        return m;
    }

    public boolean deleteConversation(String userId, String conversationId) {
        aiMapper.deleteConversation(conversationId, userId);
        return true;
    }

    public Map<String, Object> feedback(String userId, String messageId, String feedback) {
        String value = "down".equals(feedback) ? "down" : "up";
        AiMessage msg = aiMapper.message(messageId);
        if (msg == null) throw new BizException(ErrorCode.PARAM_INVALID, "消息不存在");
        aiMapper.updateFeedback(messageId, userId, value);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("messageId", messageId);
        m.put("feedback", value);
        return m;
    }

    private static boolean refusal(String s) {
        if (s == null) return false;
        String head = s.substring(0, Math.min(60, s.length()));
        return head.contains("没查到") || head.contains("没有查到") || head.contains("查不到")
                || head.contains("不掌握") || head.contains("无法回答") || head.contains("不在村务")
                || head.startsWith("抱歉");
    }

    private String titleOf(String question) {
        String t = question.replaceAll("\\s+", " ").trim();
        return t.length() > 20 ? t.substring(0, 20) : t;
    }
}
