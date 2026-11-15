package com.xinyuan.village.modules.family.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FamilyMember {
    private String id;
    private String userId;
    private String name;
    private String relation;
    private String gender;
    private Integer age;
    private String phone;
    private String idCardMasked;
    private Integer isGuardian;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
