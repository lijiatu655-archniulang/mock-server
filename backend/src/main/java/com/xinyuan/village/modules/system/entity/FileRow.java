package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FileRow {
    private String id;
    private String bizType;
    private String bizId;
    private String url;
    private String name;
    private Long sizeBytes;
    private String filePath;
    private String uploaderId;
    private LocalDateTime createdAt;
}
