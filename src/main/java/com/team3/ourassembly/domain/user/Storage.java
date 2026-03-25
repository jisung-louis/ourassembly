package com.team3.ourassembly.domain.user;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Component
public class Storage {
        private final Map<String, String> storage = new ConcurrentHashMap<>();

        public void save(String email, String code) {
            storage.put(email, code);
        }

        public String get(String email) {
            return storage.get(email);
        }

        public void remove(String email) {
            storage.remove(email);
        }

}
