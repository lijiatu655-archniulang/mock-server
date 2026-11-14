package com.xinyuan.village.config;

import com.xinyuan.village.modules.user.UserMapper;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class PasswordConfig {

    private final UserMapper userMapper;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** 演示账号初始密码：只在 password_hash 为空时写入，不覆盖用户改过的密码 */
    @Bean
    public CommandLineRunner seedPassword(BCryptPasswordEncoder encoder) {
        return args -> {
            User u = userMapper.findById("u1001");
            if (u != null && (u.getPasswordHash() == null || u.getPasswordHash().isBlank())) {
                userMapper.updatePassword(u.getId(), encoder.encode("123456"));
                log.info("seed password initialized for {} ({})", u.getName(), u.getPhone());
            }
        };
    }
}
