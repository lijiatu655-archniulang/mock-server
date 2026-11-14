package com.xinyuan.village.modules.service;

import com.xinyuan.village.modules.service.entity.DirectoryItem;
import com.xinyuan.village.modules.service.entity.JobItem;
import com.xinyuan.village.modules.service.entity.TeaMeeting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ServiceMapper {

    @Select("SELECT * FROM biz_directory ORDER BY sort, id")
    List<DirectoryItem> directory();

    @Select("SELECT * FROM biz_job WHERE status = 1 ORDER BY sort, id")
    List<JobItem> jobs();

    @Select("SELECT * FROM biz_tea_meeting ORDER BY sort, id")
    List<TeaMeeting> teaMeetings();
}
