package com.xinyuan.village.modules.auth;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.web.LoginRequired;
import com.xinyuan.village.common.web.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record LoginReq(String code, String regionId) {
    }

    public record PasswordLoginReq(String account, String password) {
    }

    @PostMapping("/password-login")
    public Result<Map<String, Object>> passwordLogin(@RequestBody(required = false) PasswordLoginReq req) {
        return Result.ok(authService.passwordLogin(
                req == null ? null : req.account(),
                req == null ? null : req.password()));
    }

    @PostMapping("/wx-login")
    public Result<Map<String, Object>> wxLogin(@RequestBody(required = false) LoginReq req) {
        String code = req == null ? null : req.code();
        String regionId = req == null ? null : req.regionId();
        return Result.ok(authService.wxLogin(code, regionId));
    }

    @PostMapping("/mock-login")
    public Result<Map<String, Object>> mockLogin(@RequestBody(required = false) LoginReq req) {
        return Result.ok(authService.mockLogin(req == null ? null : req.regionId()));
    }

    @LoginRequired
    @PostMapping("/logout")
    public Result<Boolean> logout(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        String token = auth != null && auth.startsWith("Bearer ") ? auth.substring(7).trim() : "";
        authService.logout(UserContext.get(), token);
        return Result.ok(true);
    }
}
