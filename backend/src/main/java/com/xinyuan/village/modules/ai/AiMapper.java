package com.xinyuan.village.modules.ai;

import com.xinyuan.village.modules.ai.entity.AiConversation;
import com.xinyuan.village.modules.ai.entity.AiMessage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AiMapper {

    @Insert("INSERT INTO ai_conversation (id, user_id, title, created_at, updated_at) "
            + "VALUES (#{id}, #{userId}, #{title}, NOW(), NOW())")
    int insertConversation(AiConversation c);

    @Select("SELECT * FROM ai_conversation WHERE id = #{id} AND deleted = 0")
    AiConversation conversation(String id);

    @Select("SELECT * FROM ai_conversation WHERE user_id = #{userId} AND deleted = 0 "
            + "ORDER BY updated_at DESC, id DESC LIMIT #{offset}, #{pageSize}")
    List<AiConversation> conversations(@Param("userId") String userId,
                                       @Param("offset") int offset, @Param("pageSize") int pageSize);

    @Select("SELECT COUNT(*) FROM ai_conversation WHERE user_id = #{userId} AND deleted = 0")
    long countConversations(String userId);

    @Update("UPDATE ai_conversation SET updated_at = NOW() WHERE id = #{id}")
    int touchConversation(String id);

    @Update("UPDATE ai_conversation SET deleted = 1 WHERE id = #{id} AND user_id = #{userId}")
    int deleteConversation(@Param("id") String id, @Param("userId") String userId);

    @Insert("INSERT INTO ai_message (id, conversation_id, user_id, role, content, refs, follow_ups, created_at) "
            + "VALUES (#{id}, #{conversationId}, #{userId}, #{role}, #{content}, #{refs}, #{followUps}, NOW())")
    int insertMessage(AiMessage m);

    @Select("SELECT * FROM ai_message WHERE conversation_id = #{conversationId} ORDER BY created_at, id")
    List<AiMessage> messages(String conversationId);

    @Select("SELECT COUNT(*) FROM ai_message WHERE conversation_id = #{conversationId}")
    long countMessages(String conversationId);

    @Select("SELECT * FROM ai_message WHERE id = #{id}")
    AiMessage message(String id);

    @Update("UPDATE ai_message SET feedback = #{feedback} WHERE id = #{id} AND user_id = #{userId} AND role = 'assistant'")
    int updateFeedback(@Param("id") String id, @Param("userId") String userId, @Param("feedback") String feedback);
}
