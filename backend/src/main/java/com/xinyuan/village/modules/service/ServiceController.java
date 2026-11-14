package com.xinyuan.village.modules.service;

import com.xinyuan.village.common.api.Result;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.modules.service.entity.DirectoryItem;
import com.xinyuan.village.modules.service.entity.JobItem;
import com.xinyuan.village.modules.service.entity.TeaMeeting;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceMapper serviceMapper;

    @GetMapping("/directory")
    public Result<Map<String, Object>> directory() {
        List<Map<String, Object>> list = new ArrayList<>();
        List<String> categories = new ArrayList<>();
        for (DirectoryItem d : serviceMapper.directory()) {
            if (!categories.contains(d.getCategory())) categories.add(d.getCategory());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", d.getId());
            m.put("category", d.getCategory());
            m.put("name", d.getName());
            m.put("desc", d.getDescText());
            m.put("phone", d.getPhone());
            m.put("phoneDisplay", d.getPhoneDisplay());
            m.put("hours", d.getHours());
            m.put("icon", d.getIcon());
            m.put("color", d.getColor());
            m.put("tint", d.getTint());
            list.add(m);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("categories", categories);
        return Result.ok(m);
    }

    @GetMapping("/jobs")
    public Result<Map<String, Object>> jobs() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (JobItem j : serviceMapper.jobs()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", j.getId());
            m.put("title", j.getTitle());
            m.put("company", j.getCompany());
            m.put("salary", j.getSalary());
            m.put("count", j.getCountNum());
            m.put("location", j.getLocation());
            m.put("tags", Json.parse(j.getTags()));
            m.put("desc", j.getDescText());
            m.put("contact", j.getContact());
            m.put("contactDisplay", j.getContactDisplay());
            m.put("publishedAt", j.getPublishedAt());
            m.put("deadline", j.getDeadline());
            list.add(m);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", list.size());
        return Result.ok(m);
    }

    @GetMapping("/tea-meetings")
    public Result<Map<String, Object>> teaMeetings() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (TeaMeeting t : serviceMapper.teaMeetings()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("title", t.getTitle());
            m.put("date", t.getMeetDate());
            m.put("location", t.getLocation());
            m.put("status", t.getStatus());
            m.put("joined", t.getJoined());
            m.put("total", t.getTotal());
            m.put("host", t.getHost());
            m.put("summary", t.getSummary());
            m.put("agenda", Json.parse(t.getAgenda()));
            list.add(m);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", list.size());
        return Result.ok(m);
    }
}
