package com.xinyuan.village.modules.user;

import com.xinyuan.village.modules.user.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {

    @Select("SELECT * FROM sys_user WHERE id = #{id} AND status = 1")
    User findById(String id);

    @Select("SELECT * FROM sys_user WHERE openid = #{openid} AND status = 1 LIMIT 1")
    User findByOpenid(String openid);

    @Select("SELECT * FROM sys_user WHERE phone = #{phone} AND status = 1 LIMIT 1")
    User findByPhone(String phone);

    @Select("SELECT * FROM sys_user WHERE role_code = 'grid_worker' LIMIT 1")
    User findGridWorker();

    @Update("UPDATE sys_user SET password_hash = #{hash}, updated_at = NOW() WHERE id = #{id}")
    int updatePassword(@Param("id") String id, @Param("hash") String hash);

    @Update("UPDATE sys_user SET nickname = #{nickname}, avatar_url = #{avatarUrl}, updated_at = NOW() WHERE id = #{id}")
    int updateProfile(@Param("id") String id, @Param("nickname") String nickname, @Param("avatarUrl") String avatarUrl);
}
