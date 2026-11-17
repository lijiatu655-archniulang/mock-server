package com.xinyuan.village.modules.system;

import com.xinyuan.village.modules.ai.entity.AiSuggestion;
import com.xinyuan.village.modules.system.entity.*;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface SystemMapper {

    @Select("SELECT * FROM sys_region ORDER BY level, sort, id")
    List<Region> regions();

    @Select("SELECT * FROM sys_village WHERE id = #{id}")
    Village village(String id);

    @Select("SELECT * FROM sys_village LIMIT 1")
    Village firstVillage();

    @Select("SELECT * FROM sys_config")
    List<SysConfigRow> configs();

    @Select("SELECT config_value FROM sys_config WHERE config_key = #{key}")
    String configValue(String key);

    @Select("SELECT * FROM sys_dict WHERE dict_type = #{type} ORDER BY sort")
    List<DictRow> dict(String type);

    @Select("SELECT * FROM app_module ORDER BY sort, id")
    List<AppModule> modules();

    @Select("SELECT * FROM cms_banner WHERE status = 1 ORDER BY id LIMIT 1")
    BannerRow banner();

    @Select("SELECT * FROM cms_notice WHERE status = 1 ORDER BY created_at DESC, id DESC LIMIT 1")
    NoticeRow notice();

    @Select("SELECT * FROM ai_suggestion ORDER BY sort, id")
    List<AiSuggestion> suggestions();

    @Insert("INSERT INTO sys_file (id, biz_type, biz_id, url, name, size_bytes, file_path, uploader_id) "
            + "VALUES (#{id}, #{bizType}, #{bizId}, #{url}, #{name}, #{sizeBytes}, #{filePath}, #{uploaderId})")
    int insertFile(FileRow row);

    @Insert("INSERT INTO sys_event_log (user_id, event_code, page, payload, ts, ip) "
            + "VALUES (#{userId}, #{eventCode}, #{page}, #{payload}, #{ts}, #{ip})")
    int insertEvent(EventRow row);
}