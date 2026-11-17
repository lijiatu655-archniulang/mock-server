package com.xinyuan.village.common.exception;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.i18n.I18nService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final I18nService i18n;

    @ExceptionHandler(BizException.class)
    public ResponseEntity<Result<Object>> handleBiz(BizException e) {
        ErrorCode ec = e.getErrorCode();
        if (ec.getHttpStatus() >= 500) {
            log.warn("biz error {} {}", ec.getCode(), e.getMessage());
        }
        Result<Object> body = Result.fail(ec, i18n.message(ec.getCode(), e.getMessage()));
        body.setData(e.getData());
        return ResponseEntity.status(ec.getHttpStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Object>> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldError() == null
                ? ErrorCode.PARAM_INVALID.getMessage()
                : e.getBindingResult().getFieldError().getDefaultMessage();
        return ResponseEntity.ok(Result.fail(ErrorCode.PARAM_INVALID, msg));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Object>> handleIllegal(IllegalArgumentException e) {
        return ResponseEntity.ok(Result.fail(ErrorCode.PARAM_INVALID, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Object>> handleOther(Exception e) {
        log.error("unhandled exception", e);
        return ResponseEntity.status(500).body(Result.fail(ErrorCode.SYSTEM_ERROR, i18n.message(50000, ErrorCode.SYSTEM_ERROR.getMessage())));
    }
}