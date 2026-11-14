package com.xinyuan.village.modules.gov.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class GovApply {
    private String id;
    private String applyNo;
    private String userId;
    private String itemCode;
    private String itemName;
    private String itemShortName;
    private String status;
    private Integer amount;
    private String formData;
    private String materials;
    private String missingMaterials;
    private String agentUserId;
    private String agentName;
    private Integer ratingScore;
    private String ratingComment;
    private LocalDateTime ratingTime;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime promiseAt;
}
