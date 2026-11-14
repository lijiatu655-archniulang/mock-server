package com.xinyuan.village.common.exception;

import com.xinyuan.village.common.enums.ErrorCode;
import lombok.Getter;

@Getter
public class BizException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Object data;

    public BizException(ErrorCode ec) {
        this(ec, ec.getMessage(), null);
    }

    public BizException(ErrorCode ec, String message) {
        this(ec, message, null);
    }

    public BizException(ErrorCode ec, String message, Object data) {
        super(message);
        this.errorCode = ec;
        this.data = data;
    }
}
