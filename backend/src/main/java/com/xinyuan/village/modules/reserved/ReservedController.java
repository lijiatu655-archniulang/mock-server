package com.xinyuan.village.modules.reserved;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * V3 / V4 预留接口：契约冻结，统一返回 40004，前端已有调用位。
 */
@RestController
@RequestMapping("/api/v1")
public class ReservedController {

    private BizException v3() {
        return new BizException(ErrorCode.NOT_OPEN, "该能力将在 V3 版本开放");
    }

    @GetMapping("/workbench/summary")
    public Result<Object> summary() {
        throw new BizException(ErrorCode.NOT_OPEN, "网格员工作台将在 V3 版本开放");
    }

    @GetMapping("/workbench/applies")
    public Result<Object> workbenchApplies() {
        throw v3();
    }

    @GetMapping("/workbench/requests")
    public Result<Object> workbenchRequests() {
        throw v3();
    }

    @PostMapping("/workbench/visits")
    public Result<Object> createVisit(@RequestBody(required = false) Map<String, Object> body) {
        throw v3();
    }

    @GetMapping("/workbench/visits")
    public Result<Object> visits() {
        throw v3();
    }

    @PostMapping("/workbench/events")
    public Result<Object> reportEvent(@RequestBody(required = false) Map<String, Object> body) {
        throw v3();
    }

    @PostMapping("/workbench/events/{id}/transfer")
    public Result<Object> transfer(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        throw v3();
    }

    @GetMapping("/users/family")
    public Result<Object> family() {
        throw v3();
    }

    @PostMapping("/users/family")
    public Result<Object> bindFamily(@RequestBody(required = false) Map<String, Object> body) {
        throw v3();
    }

    @PostMapping("/ai/agent/exec")
    public Result<Object> agent(@RequestBody(required = false) Map<String, Object> body) {
        throw v3();
    }

    @PostMapping("/share/track")
    public Result<Object> share(@RequestBody(required = false) Map<String, Object> body) {
        throw new BizException(ErrorCode.NOT_OPEN, "该能力将在 V4 版本开放");
    }

    @GetMapping("/points")
    public Result<Object> points() {
        throw new BizException(ErrorCode.NOT_OPEN, "该能力将在 V4 版本开放");
    }
}
