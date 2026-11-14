package com.xinyuan.village.modules.gov.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class GovItem {
    private String id;
    private String code;
    private String categoryId;
    private String categoryName;
    private String name;
    private String shortName;
    private String summary;
    private String icon;
    private String iconTint;
    private String tags;
    private String target;
    private Integer promiseDays;
    private String fee;
    private String phone;
    private String address;
    private String updateAt;
    private String conditionsJson;
    private String materials;
    private String steps;
    private String formFields;
    private String basis;
    private String faqs;
    private Integer status;
    private Integer sort;
}
