package com.xinyuan.village.modules.system;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SystemController {

    private final SystemService systemService;

    @GetMapping("/app/config")
    public Result<Map<String, Object>> config() {
        return Result.ok(systemService.appConfig());
    }

    @GetMapping("/modules")
    public Result<Map<String, Object>> modules() {
        return Result.ok(Map.of("list", systemService.modules()));
    }

    @GetMapping("/regions/tree")
    public Result<Map<String, Object>> regions() {
        return Result.ok(systemService.regionTree());
    }

    @GetMapping("/dicts/{type}")
    public Result<Map<String, Object>> dict(@PathVariable String type) {
        return Result.ok(systemService.dict(type));
    }

    public record EventReq(String eventCode, Object payload, String page, Long ts) {
    }

    @PostMapping("/events")
    public Result<Boolean> event(@RequestBody(required = false) EventReq req, HttpServletRequest http) {
        if (req != null && req.eventCode() != null) {
            systemService.event(UserContext.userIdOrNull(), req.eventCode(), req.page(), req.payload(), req.ts(),
                    http.getRemoteAddr());
        }
        return Result.ok(true);
    }

    @LoginRequired
    @PostMapping("/files")
    public Result<Map<String, Object>> upload(@RequestParam("file") MultipartFile file,
                                               @RequestParam(required = false, defaultValue = "avatar") String bizType,
                                               @RequestParam(required = false) String bizId) {
        return Result.ok(systemService.upload(file, bizType, bizId, UserContext.userIdOrNull()));
    }
}
