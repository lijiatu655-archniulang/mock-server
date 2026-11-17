package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class NoticeRow {
    private String id;
    private String text;
    private String type;
    private String articleId;
    private String images;
    private Integer status;
}