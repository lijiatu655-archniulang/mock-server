package com.xinyuan.village.modules.user.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class User {
    private String id;
    private String openid;
    private String name;
    private String nickname;
    private String roleCode;
    private String roleName;
    private String phone;
    private String phoneDisplay;
    private String avatarText;
    private String avatarUrl;
    private String regionId;
    private String gridName;
    private String houseNo;
    private LocalDate joinedAt;
    private Integer isVerified;
    private Integer status;
}
