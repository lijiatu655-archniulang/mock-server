package com.xinyuan.village.modules.gov.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class GovApplyLog {
    private Long id;
    private String applyId;
    private String status;
    private String label;
    private String timeText;
    private String operator;
    private String note;
    private Integer sort;
}
