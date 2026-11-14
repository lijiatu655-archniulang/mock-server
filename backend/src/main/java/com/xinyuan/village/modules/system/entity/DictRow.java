package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DictRow {
    private String dictType;
    private String dictValue;
    private String dictLabel;
    private Integer sort;
}
