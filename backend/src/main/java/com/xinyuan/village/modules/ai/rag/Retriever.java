package com.xinyuan.village.modules.ai.rag;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 轻量 BM25：中文按“单字 + 相邻二元组”切词，英文/数字按词。
 * 语料只有几十个 chunk，内存检索足够，且不引入向量库/外部依赖。
 */
public class Retriever {

    public record Scored(Chunk chunk, double score, double coverage) {
    }

    /** 高频虚词/疑问词，避免“今天天气怎么样”召回一堆无关文章 */
    private static final java.util.Set<String> STOP = java.util.Set.of(
            "的", "了", "是", "在", "有", "和", "与", "就", "都", "也", "还", "要", "会", "能",
            "这", "那", "哪", "个", "些", "我", "你", "他", "她", "它", "们", "请", "问", "想",
            "吗", "呢", "吧", "啊", "怎", "么", "样", "今", "天", "气", "怎么", "怎样", "什么",
            "如何", "今天", "天气", "可以", "一下", "哪些", "需要", "多少",
            "区别", "不同", "关系", "有什么", "是什么", "怎么办", "请问");

    private final List<Chunk> chunks;
    private final List<Map<String, Integer>> termFreqs = new ArrayList<>();
    private final List<Integer> lengths = new ArrayList<>();
    private final Map<String, Integer> docFreq = new HashMap<>();
    private final double avgLength;
    private static final double K1 = 1.5;
    private static final double B = 0.75;

    public Retriever(List<Chunk> chunks) {
        this.chunks = chunks;
        for (Chunk c : chunks) {
            List<String> tokens = tokenize(c.title() + " " + c.text());
            Map<String, Integer> tf = new HashMap<>();
            for (String t : tokens) tf.merge(t, 1, Integer::sum);
            termFreqs.add(tf);
            lengths.add(tokens.size());
            for (String t : tf.keySet()) docFreq.merge(t, 1, Integer::sum);
        }
        this.avgLength = lengths.stream().mapToInt(Integer::intValue).average().orElse(1);
    }

    public List<Scored> search(String query, int topK) {
        List<String> q = tokenize(query);
        java.util.Set<String> distinct = new java.util.LinkedHashSet<>(q);
        if (distinct.isEmpty()) return List.of();
        List<Scored> scored = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            Map<String, Integer> tf = termFreqs.get(i);
            double len = lengths.get(i);
            double score = 0;
            for (String term : q) {
                Integer f = tf.get(term);
                if (f == null) continue;
                int df = docFreq.getOrDefault(term, 0);
                double idf = Math.log(1 + (chunks.size() - df + 0.5) / (df + 0.5));
                double weight = term.length() >= 2 ? 1.6 : 0.6;
                score += weight * idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * len / avgLength));
            }
            int matched = 0;
            for (String term : distinct) if (tf.containsKey(term)) matched++;
            double coverage = (double) matched / distinct.size();
            if (score > 0) scored.add(new Scored(chunks.get(i), score, coverage));
        }
        scored.sort((a, b) -> Double.compare(b.score(), a.score()));
        return scored.size() > topK ? scored.subList(0, topK) : scored;
    }

    static List<String> tokenize(String text) {
        List<String> out = new ArrayList<>();
        if (text == null) return out;
        String s = text.toLowerCase();
        StringBuilder run = new StringBuilder();
        StringBuilder word = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (isCjk(ch)) {
                if (word.length() > 0) { out.add(word.toString()); word.setLength(0); }
                run.append(ch);
            } else if (Character.isLetterOrDigit(ch)) {
                if (run.length() > 0) { addCjk(run, out); run.setLength(0); }
                word.append(ch);
            } else {
                if (run.length() > 0) { addCjk(run, out); run.setLength(0); }
                if (word.length() > 0) { out.add(word.toString()); word.setLength(0); }
            }
        }
        if (run.length() > 0) addCjk(run, out);
        if (word.length() > 0) out.add(word.toString());
        out.removeIf(STOP::contains);
        return out;
    }

    private static void addCjk(StringBuilder run, List<String> out) {
        for (int i = 0; i < run.length(); i++) out.add(String.valueOf(run.charAt(i)));
        for (int i = 0; i + 1 < run.length(); i++) out.add(run.substring(i, i + 2));
    }

    private static boolean isCjk(char ch) {
        return ch >= 0x4E00 && ch <= 0x9FFF;
    }
}
