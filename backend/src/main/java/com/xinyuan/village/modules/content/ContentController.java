package com.xinyuan.village.modules.content;

import com.xinyuan.village.common.api.PageResult;
import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/columns")
    public Result<Map<String, Object>> columns() {
        return Result.ok(Map.of("list", contentService.columns()));
    }

    @GetMapping("/articles")
    public Result<PageResult<Map<String, Object>>> articles(
            @RequestParam(required = false) String columnId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.ok(contentService.page(columnId, page, pageSize));
    }

    @GetMapping("/articles/{id}")
    public Result<Map<String, Object>> detail(@PathVariable String id) {
        return Result.ok(contentService.detail(id, UserContext.userIdOrNull()));
    }

    public record LikeReq(Boolean liked) {
    }

    @LoginRequired
    @PostMapping("/articles/{id}/like")
    public Result<Map<String, Object>> like(@PathVariable String id,
                                            @RequestBody(required = false) LikeReq req) {
        return Result.ok(contentService.like(id, UserContext.requireUserId(), req == null ? null : req.liked()));
    }
}
