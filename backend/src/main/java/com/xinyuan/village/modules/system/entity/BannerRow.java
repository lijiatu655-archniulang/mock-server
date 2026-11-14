package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BannerRow {
    private String id;
    private String tag;
    private String title;
    private String titleHighlight;
    private String subtitle;
    private String meta;
    private String actionText;
    private String articleId;
    private String theme;
    private Integer status;
}
