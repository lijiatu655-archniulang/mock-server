package com.xinyuan.village.modules.family;

import com.xinyuan.village.modules.family.entity.FamilyMember;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FamilyMapper {

    @Select("SELECT * FROM user_family_member WHERE user_id = #{userId} ORDER BY created_at, id")
    List<FamilyMember> list(String userId);

    @Select("SELECT * FROM user_family_member WHERE id = #{id} AND user_id = #{userId}")
    FamilyMember find(@Param("id") String id, @Param("userId") String userId);

    @Insert("INSERT INTO user_family_member (id, user_id, name, relation, gender, age, phone, id_card_masked, is_guardian) " +
            "VALUES (#{id}, #{userId}, #{name}, #{relation}, #{gender}, #{age}, #{phone}, #{idCardMasked}, #{isGuardian})")
    int insert(FamilyMember m);

    @Update("UPDATE user_family_member SET name = #{name}, relation = #{relation}, gender = #{gender}, age = #{age}, " +
            "phone = #{phone}, id_card_masked = #{idCardMasked}, is_guardian = #{isGuardian} " +
            "WHERE id = #{id} AND user_id = #{userId}")
    int update(FamilyMember m);

    @Delete("DELETE FROM user_family_member WHERE id = #{id} AND user_id = #{userId}")
    int delete(@Param("id") String id, @Param("userId") String userId);
}
