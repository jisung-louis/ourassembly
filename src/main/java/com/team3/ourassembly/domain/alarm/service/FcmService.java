package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import com.team3.ourassembly.domain.alarm.entity.NotificationEntity;
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

    @Transactional
    public void sendNotificationToAllUsers(String title, String body, String url) {

        List<UserEntity> allUsers = userRepository.findAll();

        if (allUsers.isEmpty()) {
            log.info("알림을 보낼 유저가 없습니다.");
            return;
        }

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
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("title", title)
                .putData("body", body)
                .putData("url", url)
                .build();

        BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message, false);
        log.info("FCM 발송 결과 - 성공: {}건, 실패: {}건", response.getSuccessCount(), response.getFailureCount());

        // 무효 토큰 수집 후 DB에서 삭제
        if (response.getFailureCount() > 0) {
            List<String> invalidTokens = new ArrayList<>();
            List<SendResponse> responses = response.getResponses();

            for (int i = 0; i < responses.size(); i++) {
                SendResponse sr = responses.get(i);
                if (!sr.isSuccessful()) {
                    MessagingErrorCode code = sr.getException().getMessagingErrorCode();
                    log.error("FCM 실패 에러코드: {}, 토큰: {}", code, tokens.get(i));

                    if (code == MessagingErrorCode.UNREGISTERED
                            || code == MessagingErrorCode.INVALID_ARGUMENT) {
                        invalidTokens.add(tokens.get(i));
                    }
                }
            }

            if (!invalidTokens.isEmpty()) {
                userRepository.clearFcmTokensByTokens(invalidTokens);
                log.warn("무효 FCM 토큰 {}개 DB에서 삭제 완료", invalidTokens.size());
            }
        }
    }

    public void sendMessage(String title, String body, String fcmToken, String url) throws FirebaseMessagingException {
        if (fcmToken == null || fcmToken.isEmpty()) return;

        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
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