package com.xinyuan.village.modules.gov.entity;

import lombok.Data;

@Data
public class GovCategory {
    private String id;
    private String code;
    private String name;
    private String descText;
    private Integer sort;
    private Integer itemCount;
}
