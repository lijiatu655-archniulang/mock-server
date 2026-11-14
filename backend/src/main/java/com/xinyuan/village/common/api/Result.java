package com.xinyuan.village.common.api;

import com.xinyuan.village.common.enums.ErrorCode;
import lombok.Data;
import org.slf4j.MDC;

@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;
    private String traceId;
    private long timestamp = System.currentTimeMillis();

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.code = 0;
        r.message = "ok";
        r.data = data;
        r.traceId = MDC.get("traceId");
        return r;
    }

    public static <T> Result<T> ok() {
        return ok(null);
    }

    public static <T> Result<T> fail(ErrorCode ec, String message) {
        Result<T> r = new Result<>();
        r.code = ec.getCode();
        r.message = message == null ? ec.getMessage() : message;
        r.data = null;
        r.traceId = MDC.get("traceId");
        return r;
    }

    public static <T> Result<T> fail(ErrorCode ec) {
        return fail(ec, ec.getMessage());
    }
}
