package com.xinyuan.village.modules.user;

import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.gov.GovMapper;
import com.xinyuan.village.modules.request.RequestMapper;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.entity.Village;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class UserAssembler {

    private final SystemMapper systemMapper;
    private final GovMapper govMapper;
    private final RequestMapper requestMapper;

    @SuppressWarnings("unchecked")
    public Map<String, Object> toMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("nickname", u.getNickname());
        m.put("roleCode", u.getRoleCode());
        m.put("roleName", u.getRoleName());
        m.put("phone", u.getPhone());
        m.put("phoneDisplay", u.getPhoneDisplay());
        m.put("avatarText", u.getAvatarText());
        m.put("avatarUrl", u.getAvatarUrl() == null ? "" : u.getAvatarUrl());
        m.put("regionId", u.getRegionId());
        m.put("regionName", regionName(u.getRegionId()));
        m.put("gridName", u.getGridName());
        m.put("regionPath", regionPath(u.getRegionId()));
        m.put("houseNo", u.getHouseNo());
        m.put("joinedAt", u.getJoinedAt() == null ? null : u.getJoinedAt().toString());
        m.put("isVerified", u.getIsVerified() != null && u.getIsVerified() == 1);
        m.put("stats", stats(u.getId()));
        m.put("gridWorker", gridWorker());
        return m;
    }

    public Map<String, Object> stats(String userId) {
        int applies = govMapper.countByUser(userId);
        int appeals = requestMapper.countByUser(userId);
        int ratings = govMapper.countUnratedCompleted(userId) + requestMapper.countUnratedCompleted(userId);
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("applies", applies);
        s.put("appeals", appeals);
        s.put("ratings", ratings);
        return s;
    }

    private String regionName(String regionId) {
        return systemMapper.regions().stream()
                .filter(r -> r.getId().equals(regionId))
                .map(r -> r.getName())
                .findFirst().orElse("");
    }

    private List<String> regionPath(String regionId) {
        Village v = systemMapper.firstVillage();
        Object parsed = v == null ? null : Json.parse(v.getRegionPath());
        if (parsed instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private Object gridWorker() {
        Village v = systemMapper.firstVillage();
        return v == null ? null : Json.parse(v.getGridWorker());
    }
}
