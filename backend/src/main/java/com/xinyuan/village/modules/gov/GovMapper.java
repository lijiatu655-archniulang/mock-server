package com.xinyuan.village.modules.gov;

import com.xinyuan.village.modules.gov.entity.GovApply;
import com.xinyuan.village.modules.gov.entity.GovApplyLog;
import com.xinyuan.village.modules.gov.entity.GovCategory;
import com.xinyuan.village.modules.gov.entity.GovItem;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface GovMapper {

    @Select("SELECT c.*, (SELECT COUNT(*) FROM gov_item g WHERE g.category_id = c.id AND g.status = 1) AS item_count "
            + "FROM gov_category c ORDER BY c.sort, c.id")
    List<GovCategory> categories();

    @Select({
            "<script>",
            "SELECT * FROM gov_item WHERE status = 1",
            "<if test=\"categoryId != null and categoryId != '' and categoryId != 'all'\"> AND category_id = #{categoryId} </if>",
            "<if test=\"keyword != null and keyword != ''\">",
            "  AND (name LIKE CONCAT('%', #{keyword}, '%') OR short_name LIKE CONCAT('%', #{keyword}, '%')",
            "       OR summary LIKE CONCAT('%', #{keyword}, '%'))",
            "</if>",
            "ORDER BY sort, id",
            "</script>"
    })
    List<GovItem> items(@Param("categoryId") String categoryId, @Param("keyword") String keyword);

    @Select("SELECT * FROM gov_item WHERE code = #{code} AND status = 1")
    GovItem itemByCode(String code);

    @Select("SELECT * FROM gov_item WHERE id = #{id}")
    GovItem itemById(String id);

    // ---------- 办件 ----------
    @Insert("INSERT INTO gov_apply (id, apply_no, user_id, item_code, item_name, item_short_name, status, amount, "
            + "form_data, materials, missing_materials, agent_user_id, agent_name, created_at, promise_at) "
            + "VALUES (#{id}, #{applyNo}, #{userId}, #{itemCode}, #{itemName}, #{itemShortName}, #{status}, #{amount}, "
            + "#{formData}, #{materials}, #{missingMaterials}, #{agentUserId}, #{agentName}, #{createdAt}, #{promiseAt})")
    int insertApply(GovApply apply);

    @Select("SELECT COUNT(*) FROM gov_apply WHERE apply_no LIKE CONCAT(#{prefix}, '%')")
    int countByApplyNoPrefix(String prefix);

    @Select({
            "<script>",
            "SELECT * FROM gov_apply WHERE user_id = #{userId}",
            "<if test=\"status == 'processing'\"> AND status IN ('SUBMITTED','ACCEPTED','SUPPLEMENT','APPROVED','PAID') </if>",
            "<if test=\"status == 'done'\"> AND status IN ('COMPLETED','REJECTED','CANCELED') </if>",
            "<if test=\"status != null and status != '' and status != 'processing' and status != 'done'\"> AND status = #{status} </if>",
            "ORDER BY created_at DESC, id DESC",
            "</script>"
    })
    List<GovApply> listApplies(@Param("userId") String userId, @Param("status") String status);

    @Select("SELECT * FROM gov_apply WHERE id = #{id} AND user_id = #{userId}")
    GovApply applyById(@Param("id") String id, @Param("userId") String userId);

    @Select("SELECT * FROM gov_apply_log WHERE apply_id = #{applyId} ORDER BY sort, id")
    List<GovApplyLog> applyLogs(String applyId);

    @Insert("INSERT INTO gov_apply_log (apply_id, status, label, time_text, operator, note, sort) "
            + "VALUES (#{applyId}, #{status}, #{label}, #{timeText}, #{operator}, #{note}, #{sort})")
    int insertApplyLog(GovApplyLog log);

    @Update("UPDATE gov_apply SET status = #{status}, cancel_reason = #{reason}, updated_at = NOW() WHERE id = #{id}")
    int updateApplyStatus(@Param("id") String id, @Param("status") String status, @Param("reason") String reason);

    @Update("UPDATE gov_apply SET rating_score = #{score}, rating_comment = #{comment}, "
            + "rating_time = #{time}, updated_at = NOW() WHERE id = #{id}")
    int updateApplyRating(@Param("id") String id, @Param("score") int score,
                          @Param("comment") String comment, @Param("time") java.time.LocalDateTime time);

    @Select("SELECT COUNT(*) FROM gov_apply WHERE user_id = #{userId}")
    int countByUser(String userId);

    @Select("SELECT COUNT(*) FROM gov_apply WHERE user_id = #{userId} AND status = 'COMPLETED' AND rating_score = 0")
    int countUnratedCompleted(String userId);
}
