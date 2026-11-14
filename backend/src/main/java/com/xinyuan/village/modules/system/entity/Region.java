package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Region {
    private String id;
    private String parentId;
    private String name;
    private Integer level;
    private String grid;
    private String status;
    private Integer sort;
}
