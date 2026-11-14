package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SysConfigRow {
    private String configKey;
    private String configValue;
    private String configGroup;
}
