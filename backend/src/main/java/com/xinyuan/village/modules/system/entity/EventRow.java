package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EventRow {
    private Long id;
    private String userId;
    private String eventCode;
    private String page;
    private String payload;
    private Long ts;
    private String ip;
    private LocalDateTime createdAt;
}
