package com.xinyuan.village.common.i18n;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 语言上下文：X-Lang 头优先，其次 ?lang=；只认 zh / ko，其余按 zh。
 */
@Component
public class LangFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String lang = request.getHeader("X-Lang");
        if (lang == null || lang.isBlank()) lang = request.getParameter("lang");
        String normalized = lang != null && lang.toLowerCase().startsWith("ko") ? "ko" : "zh";
        LangContext.set(normalized);
        try {
            chain.doFilter(request, response);
        } finally {
            LangContext.clear();
        }
    }
}
