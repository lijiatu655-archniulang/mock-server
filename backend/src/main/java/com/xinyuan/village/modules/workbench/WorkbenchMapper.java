package com.xinyuan.village.modules.workbench;

import com.xinyuan.village.modules.workbench.entity.Household;
import com.xinyuan.village.modules.workbench.entity.HouseholdMember;
import com.xinyuan.village.modules.workbench.entity.Notice;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface WorkbenchMapper {

    // ---------- 通知 ----------
    @Select("SELECT * FROM cms_notice WHERE status = 1 ORDER BY created_at DESC, id DESC")
    List<Notice> notices();

    @Select("SELECT * FROM cms_notice WHERE id = #{id}")
    Notice notice(String id);

    @Insert("INSERT INTO cms_notice (id, text, type, article_id, images, status) VALUES (#{id}, #{text}, #{type}, #{articleId}, #{images}, 1)")
    int insertNotice(Notice n);

    @Update("UPDATE cms_notice SET text = #{text}, type = #{type}, article_id = #{articleId}, images = #{images} WHERE id = #{id}")
    int updateNotice(Notice n);

    @Update("UPDATE cms_notice SET status = #{status} WHERE id = #{id}")
    int updateNoticeStatus(@Param("id") String id, @Param("status") int status);

    // ---------- 诉求 ----------
    @Select({
            "<script>",
            "SELECT r.id, r.request_no AS requestNo, r.type, r.type_label AS typeLabel, r.title, r.content, r.status,",
            "       r.contact_phone AS contactPhone, u.name AS userName, u.phone_display AS userPhone,",
            "       DATE_FORMAT(r.created_at,'%Y-%m-%d %H:%i') AS createdAt",
            "FROM biz_request r LEFT JOIN sys_user u ON u.id = r.user_id WHERE 1=1",
            "<if test=\"status != null and status != '' and status != 'all'\"> AND r.status = #{status} </if>",
            "ORDER BY r.created_at DESC, r.id DESC LIMIT #{offset}, #{pageSize}",
            "</script>"
    })
    List<Map<String, Object>> requests(@Param("status") String status,
                                       @Param("offset") int offset, @Param("pageSize") int pageSize);

    @Select({
            "<script>",
            "SELECT COUNT(*) FROM biz_request r WHERE 1=1",
            "<if test=\"status != null and status != '' and status != 'all'\"> AND r.status = #{status} </if>",
            "</script>"
    })
    long countRequests(@Param("status") String status);

    @Select("SELECT r.id, r.request_no AS requestNo, r.type, r.type_label AS typeLabel, r.title, r.content, " +
            "r.status, r.location, r.contact_phone AS contactPhone, u.name AS userName, u.phone_display AS userPhone, " +
            "DATE_FORMAT(r.created_at,'%Y-%m-%d %H:%i') AS createdAt " +
            "FROM biz_request r LEFT JOIN sys_user u ON u.id = r.user_id WHERE r.id = #{id}")
    Map<String, Object> requestDetail(String id);

    @Select("SELECT id, status, label, time_text AS timeText, operator, note FROM biz_request_log WHERE request_id = #{id} ORDER BY sort, id")
    List<Map<String, Object>> requestLogs(String id);

    @Select("SELECT id, time_text AS timeText, operator, content, images FROM biz_request_reply WHERE request_id = #{id} ORDER BY sort, id")
    List<Map<String, Object>> requestReplies(String id);

    @Update("UPDATE biz_request SET status = #{status} WHERE id = #{id}")
    int updateRequestStatus(@Param("id") String id, @Param("status") String status);

    @Select("SELECT COALESCE(MAX(sort),0) FROM biz_request_log WHERE request_id = #{id}")
    int maxLogSort(String id);

    @Select("SELECT COALESCE(MAX(sort),0) FROM biz_request_reply WHERE request_id = #{id}")
    int maxReplySort(String id);

    @Insert("INSERT INTO biz_request_log (request_id, status, label, time_text, operator, note, sort) " +
            "VALUES (#{requestId}, #{status}, #{label}, #{timeText}, #{operator}, #{note}, #{sort})")
    int insertRequestLog(@Param("requestId") String requestId, @Param("status") String status,
                         @Param("label") String label, @Param("timeText") String timeText,
                         @Param("operator") String operator, @Param("note") String note, @Param("sort") int sort);

    @Insert("INSERT INTO biz_request_reply (request_id, time_text, operator, content, images, sort) " +
            "VALUES (#{requestId}, #{timeText}, #{operator}, #{content}, #{images}, #{sort})")
    int insertRequestReply(@Param("requestId") String requestId, @Param("timeText") String timeText,
                           @Param("operator") String operator, @Param("content") String content,
                           @Param("images") String images, @Param("sort") int sort);

    // ---------- 户籍统计 ----------
    @Select({
            "<script>",
            "SELECT * FROM sys_household",
            "<if test=\"regionId != null and regionId != ''\"> WHERE region_id = #{regionId} </if>",
            "ORDER BY grid_name, household_no",
            "</script>"
    })
    List<Household> households(@Param("regionId") String regionId);

    @Select({
            "<script>",
            "SELECT m.* FROM sys_household_member m JOIN sys_household h ON h.id = m.household_id",
            "<if test=\"regionId != null and regionId != ''\"> WHERE h.region_id = #{regionId} </if>",
            "</script>"
    })
    List<HouseholdMember> householdMembers(@Param("regionId") String regionId);

    // ---------- 办件 ----------
    @Select({
            "<script>",
            "SELECT a.id, a.apply_no AS applyNo, a.item_code AS itemCode, a.item_name AS itemName,",
            "       a.status, a.amount, DATE_FORMAT(a.created_at,'%Y-%m-%d %H:%i') AS createdAt,",
            "       DATE_FORMAT(a.promise_at,'%Y-%m-%d %H:%i') AS promiseAt,",
            "       u.name AS userName, u.phone_display AS userPhone",
            "FROM gov_apply a LEFT JOIN sys_user u ON u.id = a.user_id WHERE 1=1",
            "<if test=\"status != null and status != '' and status != 'all'\"> AND a.status = #{status} </if>",
            "<if test=\"keyword != null and keyword != ''\"> AND (a.apply_no LIKE CONCAT('%', #{keyword}, '%') OR a.item_name LIKE CONCAT('%', #{keyword}, '%') OR u.name LIKE CONCAT('%', #{keyword}, '%')) </if>",
            "ORDER BY a.created_at DESC, a.id DESC LIMIT #{offset}, #{pageSize}",
            "</script>"
    })
    List<Map<String, Object>> applies(@Param("status") String status, @Param("keyword") String keyword,
                                      @Param("offset") int offset, @Param("pageSize") int pageSize);

    @Select({
            "<script>",
            "SELECT COUNT(*) FROM gov_apply a LEFT JOIN sys_user u ON u.id = a.user_id WHERE 1=1",
            "<if test=\"status != null and status != '' and status != 'all'\"> AND a.status = #{status} </if>",
            "<if test=\"keyword != null and keyword != ''\"> AND (a.apply_no LIKE CONCAT('%', #{keyword}, '%') OR a.item_name LIKE CONCAT('%', #{keyword}, '%') OR u.name LIKE CONCAT('%', #{keyword}, '%')) </if>",
            "</script>"
    })
    long countApplies(@Param("status") String status, @Param("keyword") String keyword);

    @Select("SELECT a.id, a.apply_no AS applyNo, a.item_code AS itemCode, a.item_name AS itemName, " +
            "a.status, a.amount, DATE_FORMAT(a.created_at,'%Y-%m-%d %H:%i') AS createdAt, " +
            "DATE_FORMAT(a.promise_at,'%Y-%m-%d %H:%i') AS promiseAt, a.form_data AS formData, " +
            "u.name AS userName, u.phone_display AS userPhone " +
            "FROM gov_apply a LEFT JOIN sys_user u ON u.id = a.user_id WHERE a.id = #{id}")
    Map<String, Object> applyDetail(String id);

    @Select("SELECT id, status, label, time_text AS timeText, operator, note FROM gov_apply_log WHERE apply_id = #{id} ORDER BY sort, id")
    List<Map<String, Object>> applyLogs(String id);

    @Update("UPDATE gov_apply SET status = #{status} WHERE id = #{id}")
    int updateApplyStatus(@Param("id") String id, @Param("status") String status);

    @Select("SELECT COALESCE(MAX(sort),0) FROM gov_apply_log WHERE apply_id = #{id}")
    int maxApplyLogSort(String id);

    @Insert("INSERT INTO gov_apply_log (apply_id, status, label, time_text, operator, note, sort) " +
            "VALUES (#{applyId}, #{status}, #{label}, #{timeText}, #{operator}, #{note}, #{sort})")
    int insertApplyLog(@Param("applyId") String applyId, @Param("status") String status,
                       @Param("label") String label, @Param("timeText") String timeText,
                       @Param("operator") String operator, @Param("note") String note, @Param("sort") int sort);

    // ---------- 概览 ----------
    @Select("SELECT COUNT(*) FROM biz_request WHERE status IN ('PENDING','ACCEPTED','PROCESSING')")
    long pendingRequests();

    @Select("SELECT COUNT(*) FROM biz_request WHERE DATE(created_at) = CURDATE()")
    long todayRequests();

    @Select("SELECT COUNT(*) FROM sys_household")
    long householdCount();

    @Select("SELECT COUNT(*) FROM sys_household_member")
    long memberCount();

    @Select("SELECT COUNT(*) FROM cms_notice WHERE status = 1")
    long noticeCount();
}