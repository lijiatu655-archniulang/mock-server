package com.xinyuan.village.modules.system;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.modules.system.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SystemService {

    private final SystemMapper systemMapper;

    @Value("${app.storage.base-dir:./data/upload}")
    private String baseDir;

    public Map<String, Object> appConfig() {
        Map<String, String> cfg = configMap();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("appName", cfg.getOrDefault("appName", "新源村情通"));
        m.put("slogan", cfg.getOrDefault("slogan", ""));
        m.put("footer", Json.parse(cfg.get("footer")));
        m.put("features", Json.parse(cfg.get("features")));
        m.put("aiDisclaimer", cfg.getOrDefault("aiDisclaimer", ""));
        m.put("aiWelcome", cfg.getOrDefault("aiWelcome", ""));
        m.put("hotline", cfg.getOrDefault("hotline", ""));
        return m;
    }

    public Map<String, String> configMap() {
        Map<String, String> map = new HashMap<>();
        for (SysConfigRow c : systemMapper.configs()) map.put(c.getConfigKey(), c.getConfigValue());
        return map;
    }

    public List<Map<String, Object>> modules() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (AppModule m : systemMapper.modules()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", m.getId());
            row.put("code", m.getCode());
            row.put("name", m.getName());
            row.put("desc", m.getDescText());
            row.put("icon", m.getIcon());
            row.put("tint", m.getTint());
            row.put("route", m.getRoute());
            row.put("status", m.getStatus());
            row.put("badge", m.getBadge() == null ? "" : m.getBadge());
            row.put("version", m.getVersion());
            row.put("highlight", m.getHighlight() != null && m.getHighlight() == 1);
            list.add(row);
        }
        return list;
    }

    public Map<String, Object> regionTree() {
        List<Region> all = systemMapper.regions();
        Map<String, List<Region>> children = new HashMap<>();
        for (Region r : all) {
            children.computeIfAbsent(r.getParentId(), k -> new ArrayList<>()).add(r);
        }
        List<Map<String, Object>> tree = new ArrayList<>();
        for (Region root : children.getOrDefault("", List.of())) {
            tree.add(node(root, children));
        }
        Village v = systemMapper.firstVillage();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("tree", tree);
        m.put("currentId", v == null ? null : v.getId());
        return m;
    }

    private Map<String, Object> node(Region r, Map<String, List<Region>> children) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("name", r.getName());
        m.put("level", r.getLevel());
        if (r.getGrid() != null) m.put("grid", r.getGrid());
        if (r.getStatus() != null && r.getLevel() != null && r.getLevel() == 3) m.put("status", r.getStatus());
        List<Map<String, Object>> kids = new ArrayList<>();
        for (Region c : children.getOrDefault(r.getId(), List.of())) kids.add(node(c, children));
        if (!kids.isEmpty()) m.put("children", kids);
        return m;
    }

    public Map<String, Object> dict(String type) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (DictRow d : systemMapper.dict(type)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("value", d.getDictValue());
            row.put("label", d.getDictLabel());
            list.add(row);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", type);
        m.put("list", list);
        return m;
    }

    public void event(String userId, String eventCode, String page, Object payload, Long ts, String ip) {
        try {
            EventRow row = new EventRow();
            row.setUserId(userId);
            row.setEventCode(eventCode);
            row.setPage(page);
            row.setPayload(Json.write(payload));
            row.setTs(ts);
            row.setIp(ip);
            systemMapper.insertEvent(row);
        } catch (Exception ignored) {
            // 埋点失败不影响主流程
        }
    }

    public Map<String, Object> upload(MultipartFile file, String bizType, String bizId, String uploaderId) {
        if (file == null || file.isEmpty()) throw new BizException(ErrorCode.PARAM_INVALID, "文件为空");
        String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String ext = FileUtil.extName(original);
        String name = IdUtil.fastSimpleUUID() + (ext == null || ext.isBlank() ? "" : "." + ext);
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        File dest = new File(baseDir + "/" + datePath + "/" + name).getAbsoluteFile();
        FileUtil.mkParentDirs(dest);
        try (var in = file.getInputStream()) {
            Files.copy(in, dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "文件保存失败");
        }
        String url = configMap().getOrDefault("fileBaseUrl", "http://127.0.0.1:8080/static/upload")
                + "/" + datePath + "/" + name;
        FileRow row = new FileRow();
        row.setId("f_" + IdUtil.fastSimpleUUID().substring(0, 12));
        row.setBizType(bizType == null ? "avatar" : bizType);
        row.setBizId(bizId);
        row.setUrl(url);
        row.setName(original);
        row.setSizeBytes(file.getSize());
        row.setFilePath(datePath + "/" + name);
        row.setUploaderId(uploaderId);
        systemMapper.insertFile(row);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row.getId());
        m.put("url", url);
        m.put("name", original);
        return m;
    }

    public Map<String, Object> banner() {
        BannerRow b = systemMapper.banner();
        if (b == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("tag", b.getTag());
        m.put("title", b.getTitle());
        m.put("titleHighlight", b.getTitleHighlight());
        m.put("subtitle", b.getSubtitle());
        m.put("meta", b.getMeta());
        m.put("actionText", b.getActionText());
        m.put("articleId", b.getArticleId());
        m.put("theme", b.getTheme());
        return m;
    }

    public Map<String, Object> notice() {
        NoticeRow n = systemMapper.notice();
        if (n == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("text", n.getText());
        m.put("type", n.getType());
        m.put("articleId", n.getArticleId());
        return m;
    }
}
