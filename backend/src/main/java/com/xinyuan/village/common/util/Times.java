package com.xinyuan.village.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class Times {
    public static final DateTimeFormatter MINUTE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    public static final DateTimeFormatter SECOND = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Times() {
    }

    public static String minute(LocalDateTime t) {
        return t == null ? null : t.format(MINUTE);
    }

    public static String second(LocalDateTime t) {
        return t == null ? null : t.format(SECOND);
    }

    /** 列表展示：今天 HH:mm / 昨天 HH:mm / MM-dd / yyyy-MM-dd */
    public static String friendly(LocalDateTime t) {
        if (t == null) return "";
        LocalDate day = t.toLocalDate();
        LocalDate today = LocalDate.now();
        if (day.equals(today)) return "今天 " + t.format(DateTimeFormatter.ofPattern("HH:mm"));
        if (day.equals(today.minusDays(1))) return "昨天 " + t.format(DateTimeFormatter.ofPattern("HH:mm"));
        if (day.getYear() == today.getYear()) return t.format(DateTimeFormatter.ofPattern("MM-dd"));
        return t.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    /** 详情展示：2026年11月12日 09:00 */
    public static String full(LocalDateTime t) {
        if (t == null) return "";
        return t.getYear() + "年" + t.getMonthValue() + "月" + t.getDayOfMonth() + "日 "
                + t.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    /** 跳过周末，加 n 个工作日，返回当天 19:30 */
    public static LocalDateTime addWorkdays(int days) {
        LocalDate d = LocalDate.now();
        int added = 0;
        while (added < Math.max(days, 1)) {
            d = d.plusDays(1);
            if (d.getDayOfWeek().getValue() < 6) added++;
        }
        return d.atTime(19, 30);
    }
}
