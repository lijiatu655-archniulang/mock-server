package com.xinyuan.village.modules.ai.llm;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 本地联调用的假模型：把 RAG 资料原样回显，用于验证“检索 → 提示词 → 流式”链路，不产生任何外部调用。
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "echo")
public class EchoLlmClient implements LlmClient {

    @Override
    public String chat(List<LlmMessage> messages) {
        return build(messages);
    }

    @Override
    public void chatStream(List<LlmMessage> messages, Handler handler) {
        String text = build(messages);
        int step = 6;
        for (int i = 0; i < text.length(); i += step) {
            handler.onDelta(text.substring(i, Math.min(text.length(), i + step)));
            try {
                Thread.sleep(15);
            } catch (InterruptedException ignored) {
            }
        }
    }

    private String build(List<LlmMessage> messages) {
        String context = "";
        String question = "";
        for (LlmMessage m : messages) {
            if ("system".equals(m.role()) && m.content().contains("【参考资料】")) context = m.content();
            if ("user".equals(m.role())) question = m.content();
        }
        int idx = context.lastIndexOf("【参考资料】");
        String body = idx >= 0 ? context.substring(idx + 6) : context;
        String first = body.replaceAll("\\s+", " ").trim();
        if (first.length() > 160) first = first.substring(0, 160);
        return "【模拟模型】关于“" + question + "”，我查到的本地资料是：" + first + "（echo 模式，仅用于联调）";
    }
}
