package com.xinyuan.village.modules.service.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JobItem {
    private String id;
    private String title;
    private String company;
    private String salary;
    private Integer countNum;
    private String location;
    private String tags;
    private String descText;
    private String contact;
    private String contactDisplay;
    private String publishedAt;
    private String deadline;
    private Integer status;
    private Integer sort;
}
