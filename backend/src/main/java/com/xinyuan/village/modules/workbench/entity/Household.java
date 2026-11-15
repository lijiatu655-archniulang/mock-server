package com.xinyuan.village.modules.workbench.entity;

import lombok.Data;

@Data
public class Household {
    private String id;
    private String householdNo;
    private String regionId;
    private String gridName;
    private String headName;
    private String headPhone;
    private String address;
    private Integer memberCount;
    private String category;
}
