package com.xinyuan.village.modules.ai;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import com.xinyuan.village.modules.ai.entity.AiConversation;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AnswerGenerator answerGenerator;
    private final Executor aiExecutor;

    public record ChatReq(String question, String conversationId) {
    }

    public record FeedbackReq(String feedback) {
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
                long start = System.currentTimeMillis();
                AiConversation conv = aiService.resolveConversation(userId, req.conversationId(), req.question());
                aiService.saveUserMessage(conv.getId(), userId, req.question());
                AnswerGenerator.Answer answer = answerGenerator.answerFor(req.question());
                // 先落库拿到真实 messageId，再做 meta —— 否则前端反馈会打到 "pending"
                String messageId = aiService.saveAssistant(conv.getId(), userId, answer);

                Map<String, Object> meta = new LinkedHashMap<>();
                meta.put("conversationId", conv.getId());
                meta.put("messageId", messageId);
                meta.put("intent", answer.intent());
                meta.put("needRefs", !answer.refs().isEmpty());
                send(emitter, "meta", meta);

                String text = answer.text();
                int step = 8;
                for (int i = 0; i < text.length(); i += step) {
                    String chunk = text.substring(i, Math.min(text.length(), i + step));
                    send(emitter, "delta", Map.of("text", chunk));
                    Thread.sleep(18);
                }

                if (!answer.refs().isEmpty()) {
                    send(emitter, "refs", Map.of("refs", answer.refs()));
                }

                aiService.touch(conv.getId());

                Map<String, Object> done = new LinkedHashMap<>();
                done.put("conversationId", conv.getId());
                done.put("messageId", messageId);
                done.put("latencyMs", (int) (System.currentTimeMillis() - start));
                done.put("followUps", answer.followUps());
                send(emitter, "done", done);
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
