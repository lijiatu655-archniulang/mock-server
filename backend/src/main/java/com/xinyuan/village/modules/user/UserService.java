package com.xinyuan.village.modules.user;

import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserAssembler assembler;

    public Map<String, Object> me(String userId) {
        User u = userMapper.findById(userId);
        if (u == null) throw new BizException(ErrorCode.UNAUTHORIZED, "用户不存在，请重新登录");
        return assembler.toMap(u);
    }

    public Map<String, Object> update(String userId, String nickname, String avatarUrl) {
        User u = userMapper.findById(userId);
        if (u == null) throw new BizException(ErrorCode.UNAUTHORIZED, "用户不存在，请重新登录");
        String name = nickname == null || nickname.isBlank() ? u.getNickname() : nickname.trim();
        if (name.length() < 2 || name.length() > 12) {
            throw new BizException(ErrorCode.PARAM_INVALID, "昵称 2—12 个字符");
        }
        String avatar = avatarUrl == null ? u.getAvatarUrl() : avatarUrl;
        userMapper.updateProfile(userId, name, avatar);
        return assembler.toMap(userMapper.findById(userId));
    }
}
