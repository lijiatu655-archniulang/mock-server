package com.xinyuan.village.common.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

public final class Json {
    private static final ObjectMapper M = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private Json() {
    }

    public static ObjectMapper mapper() {
        return M;
    }

    /** JSON 字符串 -> List/Map；空或非法返回 null */
    public static Object parse(String text) {
        if (text == null || text.isBlank()) return null;
        try {
            return M.readValue(text, new TypeReference<Object>() {
            });
        } catch (Exception e) {
            return null;
        }
    }

    public static String write(Object value) {
        if (value == null) return null;
        try {
            return M.writeValueAsString(value);
        } catch (Exception e) {
            return null;
        }
    }
}
