package com.xinyuan.village.modules.workbench.entity;

import lombok.Data;

@Data
public class HouseholdMember {
    private String id;
    private String householdId;
    private String name;
    private String gender;
    private Integer age;
    private String relation;
    private String idCardMasked;
    private Integer isHead;
}
