package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.service.FcmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/test/fcm")
@RequiredArgsConstructor
public class Test {

    private final FcmService fcmService;

    @PostMapping("/send-all")
    public String testBulkSend(
            @RequestParam(defaultValue = "테스트 공지") String title,
            @RequestParam(defaultValue = "1,000명 동기 발송 테스트 중입니다.") String body) {

        log.info("=== 대량 발송 테스트 API 호출됨 ===");

        // 서비스 호출 (여기서 1,000명 루프가 돌아가며 서버가 멈춘 듯한 효과가 발생함)
        fcmService.sendNotificationToAllUsers(title, body, "/notice/test");

        return "모든 발송이 완료되었습니다. 서버 로그의 소요 시간을 확인하세요!";
    }
}
