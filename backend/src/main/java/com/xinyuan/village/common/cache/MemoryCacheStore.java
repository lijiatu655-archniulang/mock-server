package com.xinyuan.village.common.cache;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MemoryCacheStore implements CacheStore {
    private record Entry(String value, long expireAt) {
        boolean expired() {
            return expireAt > 0 && System.currentTimeMillis() > expireAt;
        }
    }

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    @Override
    public String get(String key) {
        Entry e = store.get(key);
        if (e == null) return null;
        if (e.expired()) {
            store.remove(key);
            return null;
        }
        return e.value();
    }

    @Override
    public void set(String key, String value, Duration ttl) {
        store.put(key, new Entry(value, System.currentTimeMillis() + ttl.toMillis()));
    }

    @Override
    public void delete(String key) {
        store.remove(key);
    }

    @Override
    public boolean exists(String key) {
        return get(key) != null;
    }

    @Override
    public long increment(String key, Duration ttl) {
        String v = get(key);
        long next = (v == null ? 0 : Long.parseLong(v)) + 1;
        set(key, String.valueOf(next), ttl);
        return next;
    }

    @Override
    public void deleteByPrefix(String prefix) {
        store.keySet().removeIf(k -> k.startsWith(prefix));
    }
}
