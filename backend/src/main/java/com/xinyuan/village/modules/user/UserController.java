package com.xinyuan.village.modules.user;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@LoginRequired
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    public record UpdateReq(String nickname, String avatarUrl) {
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me() {
        return Result.ok(userService.me(UserContext.requireUserId()));
    }

    @PutMapping("/me")
    public Result<Map<String, Object>> update(@RequestBody UpdateReq req) {
        return Result.ok(userService.update(UserContext.requireUserId(), req.nickname(), req.avatarUrl()));
    }
}
