package com.xinyuan.village.modules.request.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BizRequest {
    private String id;
    private String requestNo;
    private String userId;
    private String type;
    private String typeLabel;
    private String title;
    private String content;
    private String location;
    private String contactPhone;
    private String photos;
    private String status;
    private Integer urgeCount;
    private Integer ratingScore;
    private String ratingComment;
    private LocalDateTime ratingTime;
    private LocalDateTime createdAt;
}
