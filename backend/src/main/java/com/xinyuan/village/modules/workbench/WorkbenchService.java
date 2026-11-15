package com.xinyuan.village.modules.workbench;

import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.workbench.entity.Household;
import com.xinyuan.village.modules.workbench.entity.HouseholdMember;
import com.xinyuan.village.modules.workbench.entity.Notice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WorkbenchService {

    private final WorkbenchMapper mapper;

    private static final Map<String, String> STATUS = Map.ofEntries(
            Map.entry("PENDING", "待受理"), Map.entry("ACCEPTED", "已受理"), Map.entry("PROCESSING", "办理中"),
            Map.entry("COMPLETED", "已办结"), Map.entry("CLOSED", "已关闭"), Map.entry("RATED", "已评价"));

    private static final DateTimeFormatter MIN = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ---------- 概览 ----------
    public Map<String, Object> summary() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("pendingRequests", mapper.pendingRequests());
        m.put("todayRequests", mapper.todayRequests());
        m.put("households", mapper.householdCount());
        m.put("population", mapper.memberCount());
        m.put("notices", mapper.noticeCount());
        return m;
    }

    // ---------- 通知 ----------
    public List<Map<String, Object>> notices() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Notice n : mapper.notices()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", n.getId());
            m.put("text", n.getText());
            m.put("type", n.getType());
            m.put("articleId", n.getArticleId());
            m.put("status", n.getStatus());
            m.put("createdAt", Times.minute(n.getCreatedAt()));
            list.add(m);
        }
        return list;
    }

    public Map<String, Object> createNotice(String text, String type, String articleId) {
        if (text == null || text.isBlank()) throw new BizException(ErrorCode.PARAM_INVALID, "请填写通知内容");
        Notice n = new Notice();
        n.setId("n" + IdUtil.getSnowflakeNextIdStr());
        n.setText(text.trim());
        n.setType("urgent".equals(type) ? "urgent" : "normal");
        n.setArticleId(articleId == null || articleId.isBlank() ? null : articleId);
        mapper.insertNotice(n);
        return notice(mapper.notice(n.getId()));
    }

    public Map<String, Object> updateNotice(String id, String text, String type, String articleId) {
        Notice n = mapper.notice(id);
        if (n == null) throw new BizException(ErrorCode.PARAM_INVALID, "通知不存在");
        if (text != null && !text.isBlank()) n.setText(text.trim());
        if (type != null) n.setType("urgent".equals(type) ? "urgent" : "normal");
        if (articleId != null) n.setArticleId(articleId.isBlank() ? null : articleId);
        mapper.updateNotice(n);
        return notice(mapper.notice(id));
    }

    public Map<String, Object> deleteNotice(String id) {
        if (mapper.notice(id) == null) throw new BizException(ErrorCode.PARAM_INVALID, "通知不存在");
        mapper.updateNoticeStatus(id, 0);
        return Map.of("id", id);
    }

    private Map<String, Object> notice(Notice n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("text", n.getText());
        m.put("type", n.getType());
        m.put("articleId", n.getArticleId());
        m.put("status", n.getStatus());
        m.put("createdAt", Times.minute(n.getCreatedAt()));
        return m;
    }

    // ---------- 诉求 ----------
    public Map<String, Object> requests(String status, int page, int pageSize) {
        int p = Math.max(1, page);
        int size = Math.min(Math.max(1, pageSize), 50);
        List<Map<String, Object>> list = mapper.requests(status, (p - 1) * size, size);
        for (Map<String, Object> r : list) {
            r.put("statusLabel", STATUS.getOrDefault(String.valueOf(r.get("status")), String.valueOf(r.get("status"))));
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("list", list);
        m.put("total", mapper.countRequests(status));
        m.put("page", p);
        m.put("pageSize", size);
        return m;
    }

    public Map<String, Object> requestDetail(String id) {
        Map<String, Object> r = mapper.requestDetail(id);
        if (r == null) throw new BizException(ErrorCode.PARAM_INVALID, "诉求不存在");
        r.put("statusLabel", STATUS.getOrDefault(String.valueOf(r.get("status")), String.valueOf(r.get("status"))));
        r.put("logs", mapper.requestLogs(id));
        r.put("replies", mapper.requestReplies(id));
        return r;
    }

    private void log(String requestId, String status, String label, String operator, String note) {
        int sort = mapper.maxLogSort(requestId) + 1;
        mapper.insertRequestLog(requestId, status, label, MIN.format(LocalDateTime.now()), operator, note, sort);
    }

    @Transactional
    public Map<String, Object> accept(String id, String operator) {
        Map<String, Object> r = mapper.requestDetail(id);
        if (r == null) throw new BizException(ErrorCode.PARAM_INVALID, "诉求不存在");
        String status = String.valueOf(r.get("status"));
        if (!"PENDING".equals(status)) throw new BizException(ErrorCode.PARAM_INVALID, "该诉求已受理或已办结");
        mapper.updateRequestStatus(id, "ACCEPTED");
        log(id, "ACCEPTED", "已受理", operator, "网格员已受理，正在办理");
        return requestDetail(id);
    }

    @Transactional
    public Map<String, Object> reply(String id, String content, String operator) {
        if (content == null || content.isBlank()) throw new BizException(ErrorCode.PARAM_INVALID, "请填写回复内容");
        Map<String, Object> r = mapper.requestDetail(id);
        if (r == null) throw new BizException(ErrorCode.PARAM_INVALID, "诉求不存在");
        String status = String.valueOf(r.get("status"));
        if ("COMPLETED".equals(status) || "CLOSED".equals(status)) {
            throw new BizException(ErrorCode.PARAM_INVALID, "该诉求已办结，不能回复");
        }
        int sort = mapper.maxReplySort(id) + 1;
        mapper.insertRequestReply(id, MIN.format(LocalDateTime.now()), operator, content.trim(), sort);
        if (!"PROCESSING".equals(status)) {
            mapper.updateRequestStatus(id, "PROCESSING");
            log(id, "PROCESSING", "已回复", operator, content.trim());
        }
        return requestDetail(id);
    }

    @Transactional
    public Map<String, Object> complete(String id, String operator) {
        Map<String, Object> r = mapper.requestDetail(id);
        if (r == null) throw new BizException(ErrorCode.PARAM_INVALID, "诉求不存在");
        String status = String.valueOf(r.get("status"));
        if ("COMPLETED".equals(status)) throw new BizException(ErrorCode.PARAM_INVALID, "该诉求已办结");
        mapper.updateRequestStatus(id, "COMPLETED");
        log(id, "COMPLETED", "已办结", operator, "办结归档");
        return requestDetail(id);
    }

    // ---------- 户籍统计 ----------
    public Map<String, Object> statistics(String regionId) {
        List<Household> hh = mapper.households(regionId);
        List<HouseholdMember> members = mapper.householdMembers(regionId);

        Map<String, int[]> grid = new LinkedHashMap<>();
        int male = 0, female = 0;
        int a0 = 0, a18 = 0, a60 = 0;
        Map<String, Integer> categories = new LinkedHashMap<>();

        for (Household h : hh) {
            int[] c = grid.computeIfAbsent(h.getGridName() == null ? "未分网格" : h.getGridName(), k -> new int[2]);
            c[0]++;
            categories.merge(h.getCategory() == null ? "常住" : h.getCategory(), 1, Integer::sum);
        }
        for (HouseholdMember m : members) {
            if ("女".equals(m.getGender())) female++; else male++;
            if (m.getAge() == null) continue;
            if (m.getAge() < 18) a0++;
            else if (m.getAge() < 60) a18++;
            else a60++;
        }

        // 网格人口：按户所在网格分摊成员
        Map<String, Integer> gridPop = new LinkedHashMap<>();
        Map<String, String> hhGrid = new HashMap<>();
        for (Household h : hh) hhGrid.put(h.getId(), h.getGridName() == null ? "未分网格" : h.getGridName());
        for (HouseholdMember m : members) {
            String g = hhGrid.getOrDefault(m.getHouseholdId(), "未分网格");
            gridPop.merge(g, 1, Integer::sum);
        }

        List<Map<String, Object>> grids = new ArrayList<>();
        for (Map.Entry<String, int[]> e : grid.entrySet()) {
            Map<String, Object> g = new LinkedHashMap<>();
            g.put("gridName", e.getKey());
            g.put("households", e.getValue()[0]);
            g.put("population", gridPop.getOrDefault(e.getKey(), 0));
            grids.add(g);
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("households", hh.size());
        m.put("population", members.size());
        m.put("grids", grids);
        m.put("gender", Map.of("male", male, "female", female));
        m.put("ageBuckets", List.of(
                Map.of("label", "0-17", "count", a0),
                Map.of("label", "18-59", "count", a18),
                Map.of("label", "60+", "count", a60)));
        List<Map<String, Object>> cats = new ArrayList<>();
        categories.forEach((k, v) -> cats.add(Map.of("label", k, "count", v)));
        m.put("categories", cats);
        return m;
    }
}
