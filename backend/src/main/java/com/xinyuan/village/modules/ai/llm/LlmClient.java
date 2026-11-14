package com.xinyuan.village.modules.ai.llm;

import java.util.List;

public interface LlmClient {
    String chat(List<LlmMessage> messages);

    void chatStream(List<LlmMessage> messages, Handler handler);

    interface Handler {
        void onDelta(String delta);
    }
}
