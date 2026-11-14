package com.xinyuan.village.modules.gov;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@LoginRequired
@RestController
@RequestMapping("/api/v1/gov/applies")
@RequiredArgsConstructor
public class ApplyController {

    private final ApplyService applyService;

    @PostMapping
    public Result<Map<String, Object>> create(@RequestBody ApplyService.CreateReq req) {
        return Result.ok(applyService.create(UserContext.requireUserId(), req));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String status) {
        return Result.ok(applyService.list(UserContext.requireUserId(), status));
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable String id) {
        return Result.ok(applyService.detail(UserContext.requireUserId(), id));
    }

    public record CancelReq(String reason) {
    }

    @PostMapping("/{id}/cancel")
    public Result<Map<String, Object>> cancel(@PathVariable String id,
                                              @RequestBody(required = false) CancelReq req) {
        return Result.ok(applyService.cancel(UserContext.requireUserId(), id, req == null ? null : req.reason()));
    }

    public record RateReq(Integer score, String comment) {
    }

    @PostMapping("/{id}/rate")
    public Result<Map<String, Object>> rate(@PathVariable String id,
                                            @RequestBody(required = false) RateReq req) {
        return Result.ok(applyService.rate(UserContext.requireUserId(), id,
                req == null ? null : req.score(), req == null ? null : req.comment()));
    }

    @PostMapping("/{id}/pay")
    public Result<Object> pay(@PathVariable String id) {
        throw new BizException(ErrorCode.NOT_OPEN, "在线缴费将在 V2.1 开放，当前支持线下代收");
    }
}
