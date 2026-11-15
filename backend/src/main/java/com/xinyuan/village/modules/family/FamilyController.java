package com.xinyuan.village.modules.family;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/family")
@LoginRequired
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService service;

    @GetMapping
    public Result<List<Map<String, Object>>> list() {
        return Result.ok(service.list(UserContext.requireUserId()));
    }

    @PostMapping
    public Result<Map<String, Object>> create(@RequestBody FamilyService.FamilyReq req) {
        return Result.ok(service.create(UserContext.requireUserId(), req));
    }

    @PutMapping("/{id}")
    public Result<Map<String, Object>> update(@PathVariable String id, @RequestBody FamilyService.FamilyReq req) {
        return Result.ok(service.update(UserContext.requireUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable String id) {
        return Result.ok(service.delete(UserContext.requireUserId(), id));
    }
}
