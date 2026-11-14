package com.xinyuan.village.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {
    @Bean("aiExecutor")
    public Executor aiExecutor() {
        ThreadPoolTaskExecutor e = new ThreadPoolTaskExecutor();
        e.setCorePoolSize(4);
        e.setMaxPoolSize(16);
        e.setQueueCapacity(100);
        e.setThreadNamePrefix("ai-");
        e.initialize();
        return e;
    }
}
