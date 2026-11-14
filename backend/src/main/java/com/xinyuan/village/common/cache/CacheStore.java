package com.xinyuan.village.common.cache;

import java.time.Duration;

public interface CacheStore {
    String get(String key);

    void set(String key, String value, Duration ttl);

    void delete(String key);

    boolean exists(String key);

    long increment(String key, Duration ttl);

    void deleteByPrefix(String prefix);
}
