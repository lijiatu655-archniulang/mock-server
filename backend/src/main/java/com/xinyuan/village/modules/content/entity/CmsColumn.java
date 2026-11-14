package com.xinyuan.village.modules.content.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CmsColumn {
    private String id;
    private String code;
    private String name;
    private String shortName;
    private String color;
    private String description;
    private Integer sort;
    private Integer status;
}
