package com.xinyuan.village.common.web;

import io.jsonwebtoken.Claims;
import lombok.Data;

@Data
public class LoginUser {
    private String userId;
    private String role;

    public static LoginUser from(Claims c) {
        LoginUser u = new LoginUser();
        u.userId = c.getSubject();
        u.role = c.get("role", String.class);
        return u;
    }
}
