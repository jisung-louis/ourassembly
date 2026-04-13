package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAlarmController {

    private final FcmService fcmService;

    @PostMapping("/push")
    public ResponseEntity<String> sendPushNotification(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String body = payload.get("message"); // 프론트에서 message로 보냈으므로 message로 받음

        // URL은 일단 빈값이나 기본값으로 처리 (필요시 프론트에서 추가 전송)
        String url = payload.getOrDefault("url", "/");

        try {
            fcmService.sendNotificationToAllUsers(title, body, url);
            return ResponseEntity.ok("전체 알림 발송 성공");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("발송 실패: " + e.getMessage());
        }
    }
}
