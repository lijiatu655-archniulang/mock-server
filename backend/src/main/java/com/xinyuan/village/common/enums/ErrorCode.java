package com.xinyuan.village.common.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(0, 200, "ok"),
    PARAM_INVALID(40001, 200, "参数不合法"),
    NOT_OPEN(40004, 200, "该能力将在后续版本开放"),
    ARTICLE_NOT_FOUND(40401, 200, "文章不存在或已下线"),
    ITEM_NOT_FOUND(40402, 200, "事项不存在或已下线"),
    NOT_FOUND(40400, 200, "接口不存在"),
    UNAUTHORIZED(20001, 401, "请先登录"),
    PASSWORD_ERROR(20003, 200, "手机号或密码不正确"),
    FORBIDDEN(20002, 403, "当前身份暂不能办理"),
    TOO_MANY(42901, 429, "请求过于频繁，请稍后再试"),
    SYSTEM_ERROR(50000, 500, "服务暂时不可用，请稍后重试"),
    UPSTREAM_TIMEOUT(50001, 504, "上游服务超时，请稍后重试");

    private final int code;
    private final int httpStatus;
    private final String message;

    ErrorCode(int code, int httpStatus, String message) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
