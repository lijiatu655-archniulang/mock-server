package com.xinyuan.village.modules.request;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.request.entity.BizRequest;
import com.xinyuan.village.modules.request.entity.BizRequestLog;
import com.xinyuan.village.modules.request.entity.BizRequestReply;
import com.xinyuan.village.modules.system.SystemMapper;
import com.xinyuan.village.modules.system.entity.DictRow;
import com.xinyuan.village.modules.user.UserMapper;
import com.xinyuan.village.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestMapper requestMapper;
    private final SystemMapper systemMapper;
    private final UserMapper userMapper;

    public record CreateReq(String type, String title, String content, String location,
                            String contactPhone, List<String> photos) {
    }

    @Transactional
    public Map<String, Object> create(String userId, CreateReq req) {
        if (req == null) throw new BizException(ErrorCode.PARAM_INVALID, "参数不合法");
        String title = req.title() == null ? "" : req.title().trim();
        String content = req.content() == null ? "" : req.content().trim();
        if (title.isEmpty()) throw new BizException(ErrorCode.PARAM_INVALID, "请填写诉求标题");
        if (content.isEmpty()) throw new BizException(ErrorCode.PARAM_INVALID, "请描述具体情况");
        String type = List.of("consult", "appeal", "suggestion").contains(req.type()) ? req.type() : "appeal";

        LocalDateTime now = LocalDateTime.now();
        String prefix = "QZ" + now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int seq = requestMapper.countByNoPrefix(prefix) + 1;

        BizRequest r = new BizRequest();
        r.setId("rq" + IdUtil.getSnowflakeNextIdStr());
        r.setRequestNo(prefix + String.format("%04d", seq));
        r.setUserId(userId);
        r.setType(type);
        r.setTypeLabel(typeLabel(type));
        r.setTitle(title);
        r.setContent(content);
        r.setLocation(req.location() == null ? "" : req.location());
        r.setContactPhone(req.contactPhone() == null ? "" : req.contactPhone());
        r.setPhotos(Json.write(req.photos() == null ? List.of() : req.photos()));
        r.setStatus("PENDING");
        r.setCreatedAt(now);
        requestMapper.insert(r);

        BizRequestLog log = new BizRequestLog();
        log.setRequestId(r.getId());
        log.setStatus("PENDING");
        log.setLabel("待受理");
        log.setTimeText(Times.minute(now));
        log.setOperator(userName(userId));
        log.setNote("提交" + typeLabel(type));
        log.setSort(1);
        requestMapper.insertLog(log);

        return detail(userId, r.getId());
    }

    public Map<String, Object> list(String userId, String status) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (BizRequest r : requestMapper.list(userId, status == null ? "" : status)) {
            list.add(card(r));
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", list.size());
        m.put("page", 1);
        m.put("pageSize", Math.max(list.size(), 1));
        m.put("hasMore", false);
        return m;
    }

    public Map<String, Object> detail(String userId, String id) {
        BizRequest r = requestMapper.byId(id, userId);
        if (r == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "诉求不存在");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("requestNo", r.getRequestNo());
        m.put("type", r.getType());
        m.put("typeLabel", r.getTypeLabel());
        m.put("title", r.getTitle());
        m.put("content", r.getContent());
        m.put("location", r.getLocation());
        m.put("contactPhone", r.getContactPhone());
        m.put("photos", Json.parse(r.getPhotos()));
        m.put("status", r.getStatus());
        m.put("statusLabel", statusLabel(r));
        m.put("createdAt", Times.minute(r.getCreatedAt()));
        m.put("urgeCount", r.getUrgeCount() == null ? 0 : r.getUrgeCount());
        m.put("rating", rating(r));
        m.put("logs", logs(id));
        m.put("replies", replies(id));
        m.put("canRate", canRate(r));
        m.put("canUrge", canUrge(r));
        m.put("hasRated", r.getRatingScore() != null && r.getRatingScore() > 0);
        return m;
    }

    @Transactional
    public Map<String, Object> rate(String userId, String id, Integer score, String comment) {
        BizRequest r = requestMapper.byId(id, userId);
        if (r == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "诉求不存在");
        if (!"COMPLETED".equals(r.getStatus()) || (r.getRatingScore() != null && r.getRatingScore() > 0)) {
            throw new BizException(ErrorCode.PARAM_INVALID, "当前状态不能评价");
        }
        int s = score == null ? 5 : Math.max(1, Math.min(5, score));
        String c = comment == null ? "" : comment.trim();
        if (c.length() > 200) c = c.substring(0, 200);
        LocalDateTime now = LocalDateTime.now();
        requestMapper.updateRating(id, s, c, now);

        BizRequestLog log = new BizRequestLog();
        log.setRequestId(id);
        log.setStatus("RATED");
        log.setLabel("已评价");
        log.setTimeText(Times.minute(now));
        log.setOperator(userName(userId));
        log.setNote(s + " 星" + (c.isEmpty() ? "" : "：" + c));
        log.setSort(logs(id).size() + 1);
        requestMapper.insertLog(log);
        return detail(userId, id);
    }

    @Transactional
    public Map<String, Object> urge(String userId, String id) {
        BizRequest r = requestMapper.byId(id, userId);
        if (r == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND, "诉求不存在");
        if (!canUrge(r)) throw new BizException(ErrorCode.PARAM_INVALID, "当前状态无需催办");
        requestMapper.incUrge(id);
        int count = (r.getUrgeCount() == null ? 0 : r.getUrgeCount()) + 1;

        BizRequestLog log = new BizRequestLog();
        log.setRequestId(id);
        log.setStatus(r.getStatus());
        log.setLabel("催办提醒");
        log.setTimeText(Times.minute(LocalDateTime.now()));
        log.setOperator(userName(userId));
        log.setNote("第 " + count + " 次催办，请尽快处理");
        log.setSort(logs(id).size() + 1);
        requestMapper.insertLog(log);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("urgeCount", count);
        m.put("message", "已提醒网格员");
        return m;
    }

    private String userName(String userId) {
        User u = userMapper.findById(userId);
        return u == null ? "村民" : u.getName();
    }

    private String typeLabel(String type) {
        return switch (type) {
            case "consult" -> "咨询帮办";
            case "suggestion" -> "意见建议";
            default -> "诉求建议";
        };
    }

    private boolean canRate(BizRequest r) {
        return "COMPLETED".equals(r.getStatus()) && (r.getRatingScore() == null || r.getRatingScore() == 0);
    }

    private boolean canUrge(BizRequest r) {
        return !"COMPLETED".equals(r.getStatus()) && !"RATED".equals(r.getStatus()) && !"CLOSED".equals(r.getStatus());
    }

    private String statusLabel(BizRequest r) {
        if (r.getRatingScore() != null && r.getRatingScore() > 0) return "已评价";
        for (DictRow d : systemMapper.dict("requestStatus")) {
            if (d.getDictValue().equals(r.getStatus())) return d.getDictLabel();
        }
        return r.getStatus();
    }

    private Object rating(BizRequest r) {
        if (r.getRatingScore() == null || r.getRatingScore() == 0) return 0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("score", r.getRatingScore());
        m.put("comment", r.getRatingComment());
        m.put("time", Times.minute(r.getRatingTime()));
        return m;
    }

    private List<Map<String, Object>> logs(String requestId) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (BizRequestLog l : requestMapper.logs(requestId)) {
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

    private List<String> images(String json) {
        if (json == null || json.isBlank()) return List.of();
        Object v = com.xinyuan.village.common.util.Json.parse(json);
        if (!(v instanceof List<?> raw)) return List.of();
        List<String> list = new ArrayList<>();
        for (Object o : raw) {
            if (o != null && !String.valueOf(o).isBlank()) list.add(String.valueOf(o));
        }
        return list;
    }

    private List<Map<String, Object>> replies(String requestId) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (BizRequestReply rp : requestMapper.replies(requestId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("time", rp.getTimeText());
            m.put("operator", rp.getOperator());
            m.put("content", rp.getContent());
            m.put("images", images(rp.getImages()));
            list.add(m);
        }
        return list;
    }

    public Map<String, Object> card(BizRequest r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("requestNo", r.getRequestNo());
        m.put("type", r.getType());
        m.put("typeLabel", r.getTypeLabel());
        m.put("title", r.getTitle());
        m.put("content", r.getContent());
        m.put("status", r.getStatus());
        m.put("statusLabel", statusLabel(r));
        m.put("createdAt", Times.minute(r.getCreatedAt()));
        m.put("canRate", canRate(r));
        m.put("canUrge", canUrge(r));
        return m;
    }
}