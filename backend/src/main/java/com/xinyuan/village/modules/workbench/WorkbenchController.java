package com.xinyuan.village.modules.workbench;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.AdminRequired;
import com.xinyuan.village.common.web.UserContext;
import com.xinyuan.village.modules.user.UserMapper;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/workbench")
@AdminRequired
@RequiredArgsConstructor
public class WorkbenchController {

    private final WorkbenchService service;
    private final UserMapper userMapper;

    public record NoticeReq(String text, String type, String articleId) {
    }

    public record ReplyReq(String content) {
    }

    private String operator() {
        User u = userMapper.findById(UserContext.requireUserId());
        return u == null ? "管理员" : u.getName();
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        return Result.ok(service.summary());
    }

    @GetMapping("/notices")
    public Result<Object> notices() {
        return Result.ok(service.notices());
    }

    @PostMapping("/notices")
    public Result<Map<String, Object>> createNotice(@RequestBody NoticeReq req) {
        return Result.ok(service.createNotice(req == null ? null : req.text(),
                req == null ? null : req.type(), req == null ? null : req.articleId()));
    }

    @PutMapping("/notices/{id}")
    public Result<Map<String, Object>> updateNotice(@PathVariable String id, @RequestBody NoticeReq req) {
        return Result.ok(service.updateNotice(id, req == null ? null : req.text(),
                req == null ? null : req.type(), req == null ? null : req.articleId()));
    }

    @DeleteMapping("/notices/{id}")
    public Result<Map<String, Object>> deleteNotice(@PathVariable String id) {
        return Result.ok(service.deleteNotice(id));
    }

    @GetMapping("/requests")
    public Result<Map<String, Object>> requests(@RequestParam(required = false) String status,
                                                @RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "20") int pageSize) {
        return Result.ok(service.requests(status, page, pageSize));
    }

    @GetMapping("/requests/{id}")
    public Result<Map<String, Object>> requestDetail(@PathVariable String id) {
        return Result.ok(service.requestDetail(id));
    }

    @PostMapping("/requests/{id}/accept")
    public Result<Map<String, Object>> accept(@PathVariable String id) {
        return Result.ok(service.accept(id, operator()));
    }

    @PostMapping("/requests/{id}/reply")
    public Result<Map<String, Object>> reply(@PathVariable String id, @RequestBody(required = false) ReplyReq req) {
        return Result.ok(service.reply(id, req == null ? null : req.content(), operator()));
    }

    @PostMapping("/requests/{id}/complete")
    public Result<Map<String, Object>> complete(@PathVariable String id) {
        return Result.ok(service.complete(id, operator()));
    }

    @GetMapping("/statistics/household")
    public Result<Map<String, Object>> statistics(@RequestParam(required = false) String regionId) {
        return Result.ok(service.statistics(regionId));
    }
}
