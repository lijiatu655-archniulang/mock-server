package com.xinyuan.village.modules.ai;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.JwtUtil;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import com.xinyuan.village.modules.ai.tts.TtsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final TtsService ttsService;
    private final JwtUtil jwtUtil;
    private final Executor aiExecutor;

    public record ChatReq(String question, String conversationId) {
    }

    public record FeedbackReq(String feedback) {
    }

    @GetMapping(value = "/tts", produces = "audio/mpeg")
    public ResponseEntity<byte[]> tts(@RequestParam String text,
                                      @RequestParam(defaultValue = "zh") String lang,
                                      @RequestParam(required = false) String token,
                                      HttpServletRequest request) {
        if (token != null && !token.isBlank()) {
            try {
                jwtUtil.parse(token);
            } catch (Exception e) {
                throw new BizException(ErrorCode.UNAUTHORIZED, "登录已失效，请重新登录");
            }
        }
        String key = token != null && !token.isBlank() ? "t:" + token : "ip:" + clientIp(request);
        byte[] audio = ttsService.synthesize(text, lang, key);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(1)).cachePublic())
                .body(audio);
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    @GetMapping("/suggestions")
    public Result<Map<String, Object>> suggestions() {
        return Result.ok(aiService.suggestions());
    }

    @LoginRequired
    @PostMapping("/chat")
    public Result<Map<String, Object>> chat(@RequestBody ChatReq req) {
        return Result.ok(aiService.chat(UserContext.requireUserId(), req.question(), req.conversationId()));
    }

    @LoginRequired
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestBody ChatReq req, HttpServletResponse response) {
        String userId = UserContext.requireUserId();
        if (req.question() == null || req.question().isBlank()) {
            throw new com.xinyuan.village.common.exception.BizException(
                    com.xinyuan.village.common.enums.ErrorCode.PARAM_INVALID, "请输入您的问题");
        }
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("X-Accel-Buffering", "no");

        SseEmitter emitter = new SseEmitter(120_000L);
        aiExecutor.execute(() -> {
            try {
                aiService.streamChat(userId, req.question(), req.conversationId(),
                        (event, data) -> send(emitter, event, data));
                emitter.complete();
            } catch (Exception e) {
                try {
                    send(emitter, "error", Map.of("code", 50000, "message", "AI 服务暂时不可用，请稍后重试"));
                } catch (Exception ignored) {
                }
                try {
                    emitter.complete();
                } catch (Exception ignored) {
                }
            }
        });
        return emitter;
    }

    private void send(SseEmitter emitter, String event, Object data) throws Exception {
        emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
    }

    @LoginRequired
    @PostMapping("/messages/{messageId}/feedback")
    public Result<Map<String, Object>> feedback(@PathVariable String messageId,
                                                @RequestBody(required = false) FeedbackReq req) {
        return Result.ok(aiService.feedback(UserContext.requireUserId(), messageId,
                req == null ? null : req.feedback()));
    }

    @LoginRequired
    @GetMapping("/conversations")
    public Result<Map<String, Object>> conversations(@RequestParam(defaultValue = "1") int page,
                                                     @RequestParam(defaultValue = "20") int pageSize) {
        return Result.ok(aiService.conversations(UserContext.requireUserId(), page, pageSize));
    }

    @LoginRequired
    @GetMapping("/conversations/{id}/messages")
    public Result<Map<String, Object>> messages(@PathVariable String id,
                                                @RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "50") int pageSize) {
        return Result.ok(aiService.messages(UserContext.requireUserId(), id, page, pageSize));
    }

    @LoginRequired
    @DeleteMapping("/conversations/{id}")
    public Result<Boolean> delete(@PathVariable String id) {
        return Result.ok(aiService.deleteConversation(UserContext.requireUserId(), id));
    }
}