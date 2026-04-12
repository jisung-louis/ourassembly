package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import com.team3.ourassembly.domain.alarm.entity.NotificationEntity; // 엔티티 클래스명 확인
import com.team3.ourassembly.domain.alarm.repository.NotificationRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    /**
     * [대량 발송] 전체 유저에게 공지사항 알림 전송 및 DB 저장
     */
    @Transactional
    public void sendNotificationToAllUsers(String title, String body, String url) {
        // 1. 모든 유저 조회
        List<UserEntity> allUsers = userRepository.findAll();

        if (allUsers.isEmpty()) {
            log.info("알림을 보낼 유저가 없습니다.");
            return;
        }

        // 2. DB 저장 (NotificationEntity 빌더 사용)
        // 주의: CongressmanEntity는 nullable=true여야 함
        List<NotificationEntity> notifications = allUsers.stream()
                .map(user -> NotificationEntity.builder()
                        .user(user)
                        .title(title)
                        .message(body)
                        .url(url)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
        log.info("=== {}건의 알림 내역 DB 저장 완료 ===", notifications.size());

        // 3. FCM 토큰 추출
        List<String> allTokens = allUsers.stream()
                .map(UserEntity::getFcmToken)
                .filter(token -> token != null && !token.isEmpty())
                .collect(Collectors.toList());

        if (allTokens.isEmpty()) {
            log.info("FCM 토큰을 가진 유저가 없어 푸시 발송을 스킵합니다.");
            return;
        }

        long startTime = System.currentTimeMillis();
        log.info("=== 전체 푸시 발송 시작 (대상: {}명) ===", allTokens.size());

        // 4. 500개씩 분할 전송
        for (int i = 0; i < allTokens.size(); i += 500) {
            List<String> chunk = allTokens.subList(i, Math.min(i + 500, allTokens.size()));
            try {
                sendMulticast(title, body, chunk, url);
            } catch (FirebaseMessagingException e) {
                log.error("Batch 전송 중 에러 발생: {}", e.getMessage());
            }
        }

        long endTime = System.currentTimeMillis();
        log.info("=== 푸시 발송 완료! 소요 시간: {}ms ===", (endTime - startTime));
    }

    private void sendMulticast(String title, String body, List<String> tokens, String url) throws FirebaseMessagingException {
        MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(tokens)
                // 기기 상단 알림 팝업을 위한 노티피케이션 추가
                .setNotification(com.google.firebase.messaging.Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                // 앱 내부 로직 처리를 위한 데이터 추가
                .putData("title", title)
                .putData("body", body)
                .putData("url", url)
                .build();

        BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message, false);

        if (response.getFailureCount() > 0) {
            log.warn("FCM 발송 실패 건수: {}건", response.getFailureCount());
        }
    }

    public void sendMessage(String title, String body, String fcmToken, String url) throws FirebaseMessagingException {
        if (fcmToken == null || fcmToken.isEmpty()) return;

        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(com.google.firebase.messaging.Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("title", title)
                .putData("body", body)
                .putData("url", url)
                .build();

        FirebaseMessaging.getInstance().send(message, false);
    }
}