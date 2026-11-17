package com.xinyuan.village.modules.ai.tts;

import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 语音朗读：代理在线 TTS（默认 Google translate_tts，支持 zh / ko），本地 md5 缓存 + 每分钟限流。
 * 文本不落库，只缓存音频；缓存目录随 data 一起清理。
 */
@Slf4j
@Service
public class TtsService {

    @Value("${app.tts.enabled:true}")
    private boolean enabled;

    @Value("${app.tts.base-url:https://translate.google.com/translate_tts}")
    private String baseUrl;

    @Value("${app.tts.cache-dir:./data/tts}")
    private String cacheDir;

    @Value("${app.tts.max-chars:500}")
    private int maxChars;

    @Value("${app.tts.timeout-ms:15000}")
    private long timeoutMs;

    @Value("${app.tts.per-minute:60}")
    private int perMinute;

    /** 可选 HTTP 代理，形如 127.0.0.1:7897；本机访问 Google 需要。 */
    @Value("${app.tts.proxy:}")
    private String proxy;

    private HttpClient http;

    @PostConstruct
    void init() {
        HttpClient.Builder b = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL);
        if (proxy != null && !proxy.isBlank()) {
            String[] hp = proxy.split(":");
            b.proxy(ProxySelector.of(new InetSocketAddress(hp[0], Integer.parseInt(hp[1].trim()))));
        }
        http = b.build();
    }

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public byte[] synthesize(String text, String lang, String rateKey) {
        if (!enabled) throw new BizException(ErrorCode.NOT_OPEN, "语音朗读暂未开启");
        if (text == null || text.isBlank()) throw new BizException(ErrorCode.PARAM_INVALID, "朗读文本不能为空");
        String clean = text.replaceAll("\\s+", " ").trim();
        if (clean.length() > maxChars) throw new BizException(ErrorCode.PARAM_INVALID, "朗读文本过长");

        rateLimit(rateKey);

        String tl = lang != null && lang.toLowerCase().startsWith("ko") ? "ko" : "zh-CN";
        String key = md5(tl + "|" + clean);
        Path dir = Path.of(cacheDir).toAbsolutePath();
        Path file = dir.resolve(key + ".mp3");
        try {
            if (Files.exists(file) && Files.size(file) > 0) return Files.readAllBytes(file);
            Files.createDirectories(dir);

            String url = baseUrl + "?ie=UTF-8&client=tw-ob&tl=" + URLEncoder.encode(tl, StandardCharsets.UTF_8)
                    + "&q=" + URLEncoder.encode(clean, StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofMillis(timeoutMs))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .header("Accept", "audio/mpeg,audio/*;q=0.9,*/*;q=0.1")
                    .GET().build();
            HttpResponse<byte[]> resp = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() != 200 || resp.body() == null || resp.body().length < 512) {
                throw new BizException(ErrorCode.SYSTEM_ERROR, "语音朗读暂不可用");
            }
            Files.write(file, resp.body());
            return resp.body();
        } catch (BizException e) {
            throw e;
        } catch (Exception e) {
            log.warn("tts failed lang={} len={} err={}", tl, clean.length(), e.toString());
            throw new BizException(ErrorCode.SYSTEM_ERROR, "语音朗读暂不可用");
        }
    }

    private void rateLimit(String rateKey) {
        long now = System.currentTimeMillis();
        Deque<Long> q = hits.computeIfAbsent(rateKey == null ? "anon" : rateKey, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > 60_000) q.pollFirst();
            if (q.size() >= perMinute) throw new BizException(ErrorCode.TOO_MANY);
            q.addLast(now);
        }
        if (hits.size() > 10_000) hits.clear();
    }

    private static String md5(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            return HexFormat.of().formatHex(md.digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}