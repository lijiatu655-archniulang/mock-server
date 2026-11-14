package com.xinyuan.village.modules.request;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@LoginRequired
@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping
    public Result<Map<String, Object>> create(@RequestBody RequestService.CreateReq req) {
        return Result.ok(requestService.create(UserContext.requireUserId(), req));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String status) {
        return Result.ok(requestService.list(UserContext.requireUserId(), status));
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable String id) {
        return Result.ok(requestService.detail(UserContext.requireUserId(), id));
    }

    public record RateReq(Integer score, String comment) {
    }

    @PostMapping("/{id}/rate")
    public Result<Map<String, Object>> rate(@PathVariable String id,
                                            @RequestBody(required = false) RateReq req) {
        return Result.ok(requestService.rate(UserContext.requireUserId(), id,
                req == null ? null : req.score(), req == null ? null : req.comment()));
    }

    @PostMapping("/{id}/urge")
    public Result<Map<String, Object>> urge(@PathVariable String id) {
        return Result.ok(requestService.urge(UserContext.requireUserId(), id));
    }
}
