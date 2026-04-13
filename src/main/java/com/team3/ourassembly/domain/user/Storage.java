package com.team3.ourassembly.domain.user;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Component
public class Storage {
    private final Map<String, String> storage = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> expireMap = new ConcurrentHashMap<>();  // 만료시간 저장

    public void save(String email, String code) {
        storage.put(email, code);
        expireMap.put(email, LocalDateTime.now().plusMinutes(5));  // 5분 후 만료
    }

    public String get(String email) {
        // 만료됐으면 삭제하고 null 반환
        LocalDateTime expireAt = expireMap.get(email);
        if (expireAt != null && LocalDateTime.now().isAfter(expireAt)) {
            storage.remove(email);
            expireMap.remove(email);
            return null;
        }
        return storage.get(email);
    }

    public void remove(String email) {
        storage.remove(email);
        expireMap.remove(email);
    }
}
