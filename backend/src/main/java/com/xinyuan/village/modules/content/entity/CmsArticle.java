package com.xinyuan.village.modules.content.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CmsArticle {
    private String id;
    private String columnId;
    private String title;
    private String summary;
    private String content;
    private Integer isTop;
    private LocalDateTime publishedAt;
    private Integer views;
    private Integer likes;
    private String source;
    private String author;
    private String status;
    private String columnName;
    private String columnCode;
    private String columnColor;
}
