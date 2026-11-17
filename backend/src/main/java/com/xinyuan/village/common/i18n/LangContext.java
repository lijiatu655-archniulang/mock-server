package com.xinyuan.village.common.i18n;

public final class LangContext {
    private static final ThreadLocal<String> HOLDER = new ThreadLocal<>();

    private LangContext() {
    }

    public static void set(String lang) {
        HOLDER.set(lang == null ? "zh" : lang);
    }

    public static String get() {
        String v = HOLDER.get();
        return v == null ? "zh" : v;
    }

    public static boolean isKo() {
        return "ko".equalsIgnoreCase(get());
    }

    public static void clear() {
        HOLDER.remove();
    }
}
