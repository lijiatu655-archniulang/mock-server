package com.xinyuan.village.modules.family;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.modules.family.entity.FamilyMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyMapper mapper;

    public record FamilyReq(String name, String relation, String gender, Integer age,
                            String phone, String idCardMasked, Integer isGuardian) {
    }

    public List<Map<String, Object>> list(String userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (FamilyMember m : mapper.list(userId)) out.add(toMap(m));
        return out;
    }

    public Map<String, Object> create(String userId, FamilyReq req) {
        String name = req == null || req.name() == null ? "" : req.name().trim();
        if (name.isEmpty()) throw new BizException(ErrorCode.PARAM_INVALID, "请填写成员姓名");
        FamilyMember m = new FamilyMember();
        m.setId("fm" + IdUtil.getSnowflakeNextIdStr());
        m.setUserId(userId);
        apply(m, req, name);
        mapper.insert(m);
        return toMap(mapper.find(m.getId(), userId));
    }

    public Map<String, Object> update(String userId, String id, FamilyReq req) {
        FamilyMember m = mapper.find(id, userId);
        if (m == null) throw new BizException(ErrorCode.PARAM_INVALID, "成员不存在");
        String name = req == null || req.name() == null ? m.getName() : req.name().trim();
        if (name.isEmpty()) throw new BizException(ErrorCode.PARAM_INVALID, "请填写成员姓名");
        apply(m, req, name);
        mapper.update(m);
        return toMap(mapper.find(id, userId));
    }

    public boolean delete(String userId, String id) {
        if (mapper.find(id, userId) == null) throw new BizException(ErrorCode.PARAM_INVALID, "成员不存在");
        mapper.delete(id, userId);
        return true;
    }

    private void apply(FamilyMember m, FamilyReq req, String name) {
        m.setName(name);
        if (req == null) return;
        if (req.relation() != null) m.setRelation(req.relation());
        if (req.gender() != null) m.setGender(req.gender());
        if (req.age() != null) m.setAge(req.age());
        if (req.phone() != null) m.setPhone(req.phone());
        if (req.idCardMasked() != null) m.setIdCardMasked(req.idCardMasked());
        if (req.isGuardian() != null) m.setIsGuardian(req.isGuardian());
    }

    private Map<String, Object> toMap(FamilyMember m) {
        Map<String, Object> x = new LinkedHashMap<>();
        x.put("id", m.getId());
        x.put("name", m.getName());
        x.put("relation", m.getRelation());
        x.put("gender", m.getGender());
        x.put("age", m.getAge());
        x.put("phone", m.getPhone());
        x.put("idCardMasked", m.getIdCardMasked());
        x.put("isGuardian", m.getIsGuardian());
        return x;
    }
}
