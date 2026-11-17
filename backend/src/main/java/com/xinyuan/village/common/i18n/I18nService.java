package com.xinyuan.village.common.i18n;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 朝鲜语翻译表（资源文件 i18n-ko.json）。缺失翻译时返回 null，由前端回退中文。
 * key 规约：type:id:field，字典为 dict:type:value。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class I18nService {

    private final ObjectMapper objectMapper;
    private Map<String, String> ko = Map.of();

    @PostConstruct
    void load() {
        try (InputStream in = new ClassPathResource("i18n-ko.json").getInputStream()) {
            ko = objectMapper.readValue(in, new TypeReference<Map<String, String>>() {
            });
            log.info("i18n-ko loaded: {} keys", ko.size());
        } catch (Exception e) {
            log.warn("i18n-ko.json not loaded: {}", e.toString());
        }
    }

    public Map<String, Object> ko(String type, String id, String... fields) {
        if (!LangContext.isKo() || type == null || id == null) return null;
        Map<String, Object> out = new LinkedHashMap<>();
        for (String field : fields) {
            String v = ko.get(type + ":" + id + ":" + field);
            if (v != null && !v.isBlank()) out.put(field, v);
        }
        return out.isEmpty() ? null : out;
    }

    public void attach(Map<String, Object> target, String type, String id, String... fields) {
        Map<String, Object> tr = ko(type, id, fields);
        if (tr != null && !tr.isEmpty()) target.put("i18n", Map.of("ko", tr));
    }

    public String dict(String type, String value) {
        return ko.get("dict:" + type + ":" + value);
    }

    public String message(int code, String fallback) {
        if (!LangContext.isKo()) return fallback;
        String v = ko.get("error:" + code);
        return v == null ? fallback : v;
    }
}
