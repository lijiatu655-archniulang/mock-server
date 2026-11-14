package com.xinyuan.village.modules.service.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TeaMeeting {
    private String id;
    private String title;
    private String meetDate;
    private String location;
    private String status;
    private Integer joined;
    private Integer total;
    private String host;
    private String summary;
    private String agenda;
    private Integer sort;
}
