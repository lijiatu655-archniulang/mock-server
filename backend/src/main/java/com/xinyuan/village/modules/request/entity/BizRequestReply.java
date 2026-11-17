package com.xinyuan.village.modules.request.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BizRequestReply {
    private Long id;
    private String requestId;
    private String timeText;
    private String operator;
    private String content;
    private String images;
    private Integer sort;
}