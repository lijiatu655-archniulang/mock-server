package com.xinyuan.village.modules.workbench.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notice {
    private String id;
    private String text;
    private String type;
    private String articleId;
    private String images;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}