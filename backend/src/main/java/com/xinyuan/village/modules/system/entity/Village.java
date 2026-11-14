package com.xinyuan.village.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Village {
    private String id;
    private String name;
    private String fullName;
    private String gridName;
    private String regionPath;
    private String gridWorker;
    private Integer households;
    private Integer population;
    private Integer partyMembers;
}
