package com.xinyuan.village.modules.ai.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AiSuggestion {
    private String id;
    private String text;
    private String icon;
    private Integer sort;
}
