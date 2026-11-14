package com.xinyuan.village.modules.home;

import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.content.ContentService;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.SystemService;
import com.xinyuan.village.modules.system.entity.Region;
import com.xinyuan.village.modules.system.entity.Village;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final SystemMapper systemMapper;
    private final SystemService systemService;
    private final ContentService contentService;

    public Map<String, Object> home(String regionId) {
        Village v = (regionId == null || regionId.isBlank())
                ? systemMapper.firstVillage() : systemMapper.village(regionId);
        if (v == null) v = systemMapper.firstVillage();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("region", region(v));
        m.put("regions", villages());
        m.put("notice", systemService.notice());
        m.put("banner", systemService.banner());
        m.put("columns", contentService.columns());
        m.put("articles", contentService.page(null, 1, 4).getList());
        m.put("modules", systemService.modules());
        m.put("footer", Json.parse(systemService.configMap().get("footer")));
        m.put("serverTime", LocalDateTime.now().format(Times.SECOND));
        return m;
    }

    private Map<String, Object> region(Village v) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", v.getId());
        r.put("name", v.getName());
        r.put("fullName", v.getFullName());
        r.put("gridName", v.getGridName());
        r.put("regionPath", Json.parse(v.getRegionPath()));
        r.put("gridWorker", Json.parse(v.getGridWorker()));
        r.put("households", v.getHouseholds());
        r.put("population", v.getPopulation());
        return r;
    }

    private List<Map<String, Object>> villages() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Region r : systemMapper.regions()) {
            if (r.getLevel() != null && r.getLevel() == 3) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getId());
                m.put("name", r.getName());
                m.put("status", r.getStatus());
                m.put("grid", r.getGrid());
                list.add(m);
            }
        }
        return list;
    }
}
