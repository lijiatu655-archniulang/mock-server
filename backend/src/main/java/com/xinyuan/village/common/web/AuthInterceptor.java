package com.xinyuan.village.common.web;

import com.xinyuan.village.common.cache.CacheStore;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 契约：默认公开，@LoginRequired 收紧；有 token 一律识别身份（游客可看、登录可赞）。
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {
    private final JwtUtil jwtUtil;
    private final CacheStore cache;

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) return true;
        if (!(handler instanceof HandlerMethod hm)) return true;

        boolean needLogin = hm.hasMethodAnnotation(LoginRequired.class)
                || hm.getBeanType().isAnnotationPresent(LoginRequired.class);

        String token = resolveToken(req);
        if (token != null) {
            try {
                Claims claims = jwtUtil.parse(token);
                boolean black = cache.exists("token:black:" + claims.getId());
                if (!black) UserContext.set(LoginUser.from(claims));
                else if (needLogin) throw new BizException(ErrorCode.UNAUTHORIZED, "登录已过期，请重新进入小程序");
            } catch (BizException e) {
                throw e;
            } catch (Exception e) {
                if (needLogin) throw new BizException(ErrorCode.UNAUTHORIZED, "登录已过期，请重新进入小程序");
            }
        }
        if (needLogin && UserContext.get() == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse resp, Object handler, Exception ex) {
        UserContext.clear();
    }

    private String resolveToken(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return auth.substring(7).trim();
        return null;
    }
}
