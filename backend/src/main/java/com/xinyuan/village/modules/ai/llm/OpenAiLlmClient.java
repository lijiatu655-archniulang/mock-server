package com.xinyuan.village.modules.ai.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.xinyuan.village.config.AiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiLlmClient implements LlmClient {

    private final AiProperties props;
    private final ObjectMapper mapper;

    private HttpClient client() {
        return HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    private ObjectNode body(List<LlmMessage> messages, boolean stream) {
        ObjectNode root = mapper.createObjectNode();
        root.put("model", props.getModel());
        root.put("temperature", props.getTemperature());
        root.put("max_tokens", props.getMaxTokens());
        root.put("stream", stream);
        ArrayNode arr = root.putArray("messages");
        for (LlmMessage m : messages) {
            ObjectNode n = arr.addObject();
            n.put("role", m.role());
            n.put("content", m.content());
        }
        return root;
    }

    private HttpRequest request(ObjectNode body) {
        return HttpRequest.newBuilder()
                .uri(URI.create(props.getBaseUrl().replaceAll("/$", "") + "/chat/completions"))
                .timeout(Duration.ofMillis(props.getTimeoutMs()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + props.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(body.toString(), StandardCharsets.UTF_8))
                .build();
    }

    @Override
    public String chat(List<LlmMessage> messages) {
        try {
            HttpResponse<String> resp = client().send(request(body(messages, false)),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resp.statusCode() >= 400) {
                log.warn("llm http {} body={}", resp.statusCode(), truncate(resp.body()));
                throw new IllegalStateException("llm http " + resp.statusCode());
            }
            JsonNode json = mapper.readTree(resp.body());
            return json.path("choices").path(0).path("message").path("content").asText("");
        } catch (Exception e) {
            log.warn("llm chat failed: {}", e.getMessage());
            throw new IllegalStateException("llm chat failed", e);
        }
    }

    @Override
    public void chatStream(List<LlmMessage> messages, Handler handler) {
        try {
            HttpResponse<InputStream> resp = client().send(request(body(messages, true)),
                    HttpResponse.BodyHandlers.ofInputStream());
            if (resp.statusCode() >= 400) {
                throw new IllegalStateException("llm http " + resp.statusCode());
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resp.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.isEmpty() || "[DONE]".equals(data)) continue;
                    JsonNode node = mapper.readTree(data);
                    String delta = node.path("choices").path(0).path("delta").path("content").asText("");
                    if (!delta.isEmpty()) handler.onDelta(delta);
                }
            }
        } catch (Exception e) {
            log.warn("llm stream failed: {}", e.getMessage());
            throw new IllegalStateException("llm stream failed", e);
        }
    }

    private String truncate(String s) {
        return s == null ? "" : s.substring(0, Math.min(200, s.length()));
    }
}
