package com.xinyuan.village.modules.ai;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.ai.entity.AiConversation;
import com.xinyuan.village.modules.ai.entity.AiMessage;
import com.xinyuan.village.modules.ai.entity.AiSuggestion;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiMapper aiMapper;
    private final SystemMapper systemMapper;
    private final SystemService systemService;
    private final AnswerGenerator answerGenerator;

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

    public String saveAssistant(String conversationId, String userId, AnswerGenerator.Answer answer) {
        return saveMessage(conversationId, userId, "assistant", answer.text(),
                Json.write(answer.refs()), Json.write(answer.followUps()));
    }

    public void touch(String conversationId) {
        aiMapper.touchConversation(conversationId);
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

    public Map<String, Object> chat(String userId, String question, String conversationId) {
        if (question == null || question.isBlank()) {
            throw new BizException(ErrorCode.PARAM_INVALID, "请输入您的问题");
        }
        long start = System.currentTimeMillis();
        AiConversation conv = resolveConversation(userId, conversationId, question);
        saveUserMessage(conv.getId(), userId, question);
        AnswerGenerator.Answer answer = answerGenerator.answerFor(question);
        String messageId = saveAssistant(conv.getId(), userId, answer);
        touch(conv.getId());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("conversationId", conv.getId());
        m.put("messageId", messageId);
        m.put("question", question);
        m.put("answer", answer.text());
        m.put("refs", answer.refs());
        m.put("followUps", answer.followUps());
        m.put("latencyMs", (int) (System.currentTimeMillis() - start));
        return m;
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

    private String titleOf(String question) {
        String t = question.replaceAll("\\s+", " ").trim();
        return t.length() > 20 ? t.substring(0, 20) : t;
    }
}
