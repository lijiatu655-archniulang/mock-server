package com.xinyuan.village.modules.service.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DirectoryItem {
    private String id;
    private String category;
    private String name;
    private String descText;
    private String phone;
    private String phoneDisplay;
    private String hours;
    private String icon;
    private String color;
    private String tint;
    private Integer sort;
}
