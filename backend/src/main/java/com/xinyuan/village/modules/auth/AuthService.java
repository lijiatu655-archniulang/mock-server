package com.xinyuan.village.modules.auth;

import com.xinyuan.village.common.cache.CacheStore;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.JwtUtil;
import com.xinyuan.village.common.web.LoginUser;
import com.xinyuan.village.modules.user.UserAssembler;
import com.xinyuan.village.modules.user.UserMapper;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final UserAssembler assembler;
    private final JwtUtil jwtUtil;
    private final CacheStore cache;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final int MAX_LOGIN_FAILS = 5;

    @Value("${app.jwt.mock-login:true}")
    private boolean mockLoginEnabled;

    public Map<String, Object> mockLogin(String regionId) {
        if (!mockLoginEnabled) throw new BizException(ErrorCode.NOT_FOUND, "接口不存在");
        User user = userMapper.findById("u1001");
        if (user == null) throw new BizException(ErrorCode.SYSTEM_ERROR, "种子用户不存在，请先导入 seed.sql");
        return issue(user, false);
    }

    /** 未配置 appid 时按种子用户登录，方便本地联调；配置后替换为 code2Session */
    public Map<String, Object> wxLogin(String code, String regionId) {
        if (code == null || code.isBlank()) throw new BizException(ErrorCode.PARAM_INVALID, "code 不能为空");
        User user = userMapper.findByOpenid("seed_openid_u1001");
        if (user == null) user = userMapper.findById("u1001");
        if (user == null) throw new BizException(ErrorCode.SYSTEM_ERROR, "种子用户不存在");
        return issue(user, false);
    }

    /** 账号密码登录：account=手机号，密码 BCrypt 校验；连续失败 5 次锁 10 分钟 */
    public Map<String, Object> passwordLogin(String account, String password) {
        String acc = account == null ? "" : account.trim();
        String pwd = password == null ? "" : password;
        if (acc.isEmpty() || pwd.isEmpty()) {
            throw new BizException(ErrorCode.PARAM_INVALID, "请输入手机号和密码");
        }
        String failKey = "login:fail:" + acc;
        String fails = cache.get(failKey);
        if (fails != null && Integer.parseInt(fails) >= MAX_LOGIN_FAILS) {
            throw new BizException(ErrorCode.TOO_MANY, "密码错误次数过多，请 10 分钟后再试");
        }
        User user = userMapper.findByPhone(acc);
        boolean ok = user != null && user.getPasswordHash() != null
                && passwordEncoder.matches(pwd, user.getPasswordHash());
        if (!ok) {
            cache.increment(failKey, Duration.ofMinutes(10));
            throw new BizException(ErrorCode.PASSWORD_ERROR);
        }
        cache.delete(failKey);
        return issue(user, false);
    }

    public void logout(LoginUser current, String token) {
        if (current == null) return;
        try {
            var claims = jwtUtil.parse(token);
            cache.set("token:black:" + claims.getId(), "1", Duration.ofHours(jwtUtil.getExpireSeconds() / 3600));
        } catch (Exception ignored) {
        }
    }

    private Map<String, Object> issue(User user, boolean isNew) {
        String token = jwtUtil.create(user.getId(), user.getRoleCode());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("token", token);
        m.put("tokenType", "Bearer");
        m.put("expiresIn", jwtUtil.getExpireSeconds());
        m.put("isNewUser", isNew);
        m.put("user", assembler.toMap(user));
        return m;
    }
}
