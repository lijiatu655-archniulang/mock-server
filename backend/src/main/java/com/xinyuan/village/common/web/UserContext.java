package com.xinyuan.village.common.web;

import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;

public final class UserContext {
    private static final ThreadLocal<LoginUser> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(LoginUser u) {
        HOLDER.set(u);
    }

    public static LoginUser get() {
        return HOLDER.get();
    }

    public static String userIdOrNull() {
        LoginUser u = HOLDER.get();
        return u == null ? null : u.getUserId();
    }

    public static String requireUserId() {
        LoginUser u = HOLDER.get();
        if (u == null) throw new BizException(ErrorCode.UNAUTHORIZED);
        return u.getUserId();
    }

    public static void clear() {
        HOLDER.remove();
    }
}
