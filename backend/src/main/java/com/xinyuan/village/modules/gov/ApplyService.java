package com.xinyuan.village.modules.gov;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.gov.entity.GovApply;
import com.xinyuan.village.modules.gov.entity.GovApplyLog;
import com.xinyuan.village.modules.gov.entity.GovItem;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.entity.DictRow;
import com.xinyuan.village.modules.user.UserMapper;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ApplyService {

    private final GovMapper govMapper;
    private final SystemMapper systemMapper;
    private final UserMapper userMapper;

    public record CreateReq(String itemCode, Map<String, Object> formData, List<String> materialNames,
                            List<String> fileIds, String agentUserId) {
    }

    @Transactional
    public Map<String, Object> create(String userId, CreateReq req) {
        if (req == null || req.itemCode() == null) {
            throw new BizException(ErrorCode.PARAM_INVALID, "缺少事项编号");
        }
        GovItem item = govMapper.itemByCode(req.itemCode());
        if (item == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND);

        Map<String, Object> formData = req.formData() == null ? new LinkedHashMap<>() : req.formData();
        List<String> missingFields = new ArrayList<>();
        Object fieldsObj = Json.parse(item.getFormFields());
        if (fieldsObj instanceof List<?> fields) {
            for (Object o : fields) {
                if (!(o instanceof Map<?, ?> f)) continue;
                boolean required = Boolean.TRUE.equals(f.get("required"));
                String label = String.valueOf(f.get("label"));
                Object value = formData.get(label);
                if (required && (value == null || String.valueOf(value).trim().isEmpty())) {
                    missingFields.add(label);
                }
            }
        }
        if (!missingFields.isEmpty()) {
            throw new BizException(ErrorCode.PARAM_INVALID, "请填写：" + String.join("、", missingFields));
        }

        List<String> uploaded = req.materialNames() == null ? List.of() : req.materialNames();
        List<Map<String, Object>> materials = new ArrayList<>();
        List<String> missingMaterials = new ArrayList<>();
        Object matObj = Json.parse(item.getMaterials());
        if (matObj instanceof List<?> mats) {
            for (Object o : mats) {
                if (!(o instanceof Map<?, ?> m)) continue;
                String name = String.valueOf(m.get("name"));
                boolean required = Boolean.TRUE.equals(m.get("required"));
                boolean has = uploaded.contains(name);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("name", name);
                row.put("required", required);
                row.put("uploaded", has);
                materials.add(row);
                if (required && !has) missingMaterials.add(name);
            }
        }

        User user = userMapper.findById(userId);
        String userName = user == null ? "村民" : user.getName();
        LocalDateTime now = LocalDateTime.now();
        String prefix = "SB" + now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int seq = govMapper.countByApplyNoPrefix(prefix) + 1;
        String applyNo = prefix + String.format("%04d", seq);

        GovApply apply = new GovApply();
        apply.setId("ap" + IdUtil.getSnowflakeNextIdStr());
        apply.setApplyNo(applyNo);
        apply.setUserId(userId);
        apply.setItemCode(item.getCode());
        apply.setItemName(item.getName());
        apply.setItemShortName(item.getShortName());
        apply.setStatus("SUBMITTED");
        apply.setAmount("YB001".equals(item.getCode()) ? 38000 : 0);
        apply.setFormData(Json.write(formData));
        apply.setMaterials(Json.write(materials));
        apply.setMissingMaterials(Json.write(missingMaterials));
        apply.setAgentUserId(req.agentUserId());
        apply.setAgentName(req.agentUserId() == null ? "" : "网格员 " + gridWorkerName());
        apply.setCreatedAt(now);
        apply.setPromiseAt(Times.addWorkdays(item.getPromiseDays() == null ? 3 : item.getPromiseDays()));
        govMapper.insertApply(apply);

        GovApplyLog log = new GovApplyLog();
        log.setApplyId(apply.getId());
        log.setStatus("SUBMITTED");
        log.setLabel("已提交");
        log.setTimeText(Times.minute(now));
        log.setOperator(userName);
        log.setNote(missingMaterials.isEmpty() ? "提交申请，等待受理"
                : "提交申请，待补：" + String.join("、", missingMaterials));
        log.setSort(1);
        govMapper.insertApplyLog(log);

        return detail(userId, apply.getId());
    }

    private String gridWorkerName() {
        User gw = userMapper.findGridWorker();
        return gw == null ? "李建国" : gw.getName();
    }

    public Map<String, Object> list(String userId, String status) {
        List<GovApply> rows = govMapper.listApplies(userId, status == null ? "" : status);
        List<Map<String, Object>> list = new ArrayList<>();
        for (GovApply a : rows) list.add(card(a));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", list.size());
        m.put("page", 1);
        m.put("pageSize", Math.max(list.size(), 1));
        m.put("hasMore", false);
        return m;
    }

    public Map<String, Object> detail(String userId, String id) {
        GovApply a = govMapper.applyById(id, userId);
        if (a == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "办件不存在");
        GovItem item = govMapper.itemByCode(a.getItemCode());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("applyNo", a.getApplyNo());
        m.put("itemCode", a.getItemCode());
        m.put("itemName", a.getItemName());
        m.put("itemShortName", a.getItemShortName());
        m.put("status", a.getStatus());
        m.put("statusLabel", statusLabel(a.getStatus()));
        m.put("amount", a.getAmount());
        m.put("createdAt", Times.minute(a.getCreatedAt()));
        m.put("promiseAt", Times.minute(a.getPromiseAt()));
        m.put("rating", rating(a));
        m.put("formData", Json.parse(a.getFormData()));
        m.put("materials", Json.parse(a.getMaterials()));
        m.put("missingMaterials", Json.parse(a.getMissingMaterials()));
        m.put("agentUserId", a.getAgentUserId());
        m.put("agentName", a.getAgentName() == null ? "" : a.getAgentName());
        m.put("logs", logs(a.getId()));
        m.put("itemPhone", item == null ? "0999-5021688" : item.getPhone());
        m.put("itemAddress", item == null ? "新源村党群服务中心" : item.getAddress());
        m.put("canCancel", "SUBMITTED".equals(a.getStatus()) || "DRAFT".equals(a.getStatus()));
        m.put("canRate", "COMPLETED".equals(a.getStatus()) && (a.getRatingScore() == null || a.getRatingScore() == 0));
        m.put("canPay", "APPROVED".equals(a.getStatus()));
        m.put("hasRated", a.getRatingScore() != null && a.getRatingScore() > 0);
        m.put("ratingScore", a.getRatingScore() == null ? 0 : a.getRatingScore());
        return m;
    }

    @Transactional
    public Map<String, Object> cancel(String userId, String id, String reason) {
        GovApply a = govMapper.applyById(id, userId);
        if (a == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "办件不存在");
        if (!"SUBMITTED".equals(a.getStatus()) && !"DRAFT".equals(a.getStatus())) {
            throw new BizException(ErrorCode.PARAM_INVALID, "当前状态不能撤销");
        }
        govMapper.updateApplyStatus(id, "CANCELED", reason == null ? "" : reason);
        GovApplyLog log = new GovApplyLog();
        log.setApplyId(id);
        log.setStatus("CANCELED");
        log.setLabel("已撤销");
        log.setTimeText(Times.minute(LocalDateTime.now()));
        log.setOperator(userName(userId));
        log.setNote(reason == null || reason.isBlank() ? "本人撤销申请" : reason);
        log.setSort(nextLogSort(id));
        govMapper.insertApplyLog(log);
        return detail(userId, id);
    }

    @Transactional
    public Map<String, Object> rate(String userId, String id, Integer score, String comment) {
        GovApply a = govMapper.applyById(id, userId);
        if (a == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "办件不存在");
        if (!"COMPLETED".equals(a.getStatus()) || (a.getRatingScore() != null && a.getRatingScore() > 0)) {
            throw new BizException(ErrorCode.PARAM_INVALID, "当前状态不能评价");
        }
        int s = score == null ? 5 : Math.max(1, Math.min(5, score));
        String c = comment == null ? "" : comment.trim();
        if (c.length() > 200) c = c.substring(0, 200);
        LocalDateTime now = LocalDateTime.now();
        govMapper.updateApplyRating(id, s, c, now);

        GovApplyLog log = new GovApplyLog();
        log.setApplyId(id);
        log.setStatus("COMPLETED");
        log.setLabel("已评价");
        log.setTimeText(Times.minute(now));
        log.setOperator(userName(userId));
        log.setNote(s + " 星" + (c.isEmpty() ? "" : "：" + c));
        log.setSort(nextLogSort(id));
        govMapper.insertApplyLog(log);
        return detail(userId, id);
    }

    private int nextLogSort(String applyId) {
        return govMapper.applyLogs(applyId).size() + 1;
    }

    private String userName(String userId) {
        User u = userMapper.findById(userId);
        return u == null ? "村民" : u.getName();
    }

    private Object rating(GovApply a) {
        if (a.getRatingScore() == null || a.getRatingScore() == 0) return 0;
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("score", a.getRatingScore());
        r.put("comment", a.getRatingComment());
        r.put("time", Times.minute(a.getRatingTime()));
        return r;
    }

    private List<Map<String, Object>> logs(String applyId) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (GovApplyLog l : govMapper.applyLogs(applyId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("status", l.getStatus());
            m.put("label", l.getLabel());
            m.put("time", l.getTimeText());
            m.put("operator", l.getOperator());
            m.put("note", l.getNote());
            list.add(m);
        }
        return list;
    }

    private String statusLabel(String status) {
        for (DictRow d : systemMapper.dict("applyStatus")) {
            if (d.getDictValue().equals(status)) return d.getDictLabel();
        }
        return status;
    }

    public Map<String, Object> card(GovApply a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("applyNo", a.getApplyNo());
        m.put("itemCode", a.getItemCode());
        m.put("itemName", a.getItemName());
        m.put("itemShortName", a.getItemShortName());
        m.put("status", a.getStatus());
        m.put("statusLabel", statusLabel(a.getStatus()));
        m.put("amount", a.getAmount() == null ? 0 : a.getAmount());
        m.put("createdAt", Times.minute(a.getCreatedAt()));
        m.put("promiseAt", Times.minute(a.getPromiseAt()));
        m.put("canRate", "COMPLETED".equals(a.getStatus())
                && (a.getRatingScore() == null || a.getRatingScore() == 0));
        return m;
    }
}
