package com.xinyuan.village.modules.ai.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AiMessage {
    private String id;
    private String conversationId;
    private String userId;
    private String role;
    private String content;
    private String refs;
    private String followUps;
    private String feedback;
    private LocalDateTime createdAt;
}
