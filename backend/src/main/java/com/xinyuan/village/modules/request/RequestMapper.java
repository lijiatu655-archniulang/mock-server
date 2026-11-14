package com.xinyuan.village.modules.request;

import com.xinyuan.village.modules.request.entity.BizRequest;
import com.xinyuan.village.modules.request.entity.BizRequestLog;
import com.xinyuan.village.modules.request.entity.BizRequestReply;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RequestMapper {

    @Insert("INSERT INTO biz_request (id, request_no, user_id, type, type_label, title, content, location, "
            + "contact_phone, photos, status, urge_count, created_at) "
            + "VALUES (#{id}, #{requestNo}, #{userId}, #{type}, #{typeLabel}, #{title}, #{content}, #{location}, "
            + "#{contactPhone}, #{photos}, #{status}, 0, #{createdAt})")
    int insert(BizRequest r);

    @Select("SELECT COUNT(*) FROM biz_request WHERE request_no LIKE CONCAT(#{prefix}, '%')")
    int countByNoPrefix(String prefix);

    @Select({
            "<script>",
            "SELECT * FROM biz_request WHERE user_id = #{userId}",
            "<if test=\"status == 'processing'\"> AND status IN ('PENDING','ACCEPTED','PROCESSING') </if>",
            "<if test=\"status == 'done'\"> AND status IN ('COMPLETED','CLOSED','RATED') </if>",
            "<if test=\"status != null and status != '' and status != 'processing' and status != 'done'\"> AND status = #{status} </if>",
            "ORDER BY created_at DESC, id DESC",
            "</script>"
    })
    List<BizRequest> list(@Param("userId") String userId, @Param("status") String status);

    @Select("SELECT * FROM biz_request WHERE id = #{id} AND user_id = #{userId}")
    BizRequest byId(@Param("id") String id, @Param("userId") String userId);

    @Select("SELECT * FROM biz_request_log WHERE request_id = #{requestId} ORDER BY sort, id")
    List<BizRequestLog> logs(String requestId);

    @Select("SELECT * FROM biz_request_reply WHERE request_id = #{requestId} ORDER BY sort, id")
    List<BizRequestReply> replies(String requestId);

    @Insert("INSERT INTO biz_request_log (request_id, status, label, time_text, operator, note, sort) "
            + "VALUES (#{requestId}, #{status}, #{label}, #{timeText}, #{operator}, #{note}, #{sort})")
    int insertLog(BizRequestLog log);

    @Update("UPDATE biz_request SET status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") String id, @Param("status") String status);

    @Update("UPDATE biz_request SET urge_count = urge_count + 1, updated_at = NOW() WHERE id = #{id}")
    int incUrge(String id);

    @Update("UPDATE biz_request SET rating_score = #{score}, rating_comment = #{comment}, "
            + "rating_time = #{time}, status = 'RATED', updated_at = NOW() WHERE id = #{id}")
    int updateRating(@Param("id") String id, @Param("score") int score,
                     @Param("comment") String comment, @Param("time") java.time.LocalDateTime time);

    @Select("SELECT COUNT(*) FROM biz_request WHERE user_id = #{userId}")
    int countByUser(String userId);

    @Select("SELECT COUNT(*) FROM biz_request WHERE user_id = #{userId} AND status = 'COMPLETED' AND rating_score = 0")
    int countUnratedCompleted(String userId);
}
