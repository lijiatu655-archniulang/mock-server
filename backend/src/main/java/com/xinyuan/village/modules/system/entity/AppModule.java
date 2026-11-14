package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AppModule {
    private String id;
    private String code;
    private String name;
    private String descText;
    private String icon;
    private String tint;
    private String route;
    private String status;
    private String badge;
    private String version;
    private Integer highlight;
    private Integer sort;
}
