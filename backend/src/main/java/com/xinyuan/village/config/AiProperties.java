package com.xinyuan.village.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    /** 总开关：false 时走本地规则引擎，演示不依赖外部服务 */
    private boolean enabled = false;
    /** openai / echo（echo 仅用于本地联调） */
    private String provider = "openai";
    private String baseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    private String apiKey = "";
    private String model = "qwen-plus";
    private double temperature = 0.3;
    private int maxTokens = 800;
    private int timeoutMs = 60000;
    private Rag rag = new Rag();

    @Data
    public static class Rag {
        private int topK = 4;
        private double minScore = 0.2;
        private int historyRounds = 3;
    }

    public boolean usable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
