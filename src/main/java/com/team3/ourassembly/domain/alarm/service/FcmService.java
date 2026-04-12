package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final UserRepository userRepository;

    @Transactional
    public void sendNotificationToAllUsers(String title, String body, String url) {
        List<UserEntity> allUsers = userRepository.findAll();

        long startTime = System.currentTimeMillis(); // 시작 시간 기록
        log.info("=== 1,000명 대량 발송 시작 ===");
        allUsers.forEach(user -> {
            String token = user.getFcmToken();

            if (token != null && !token.isEmpty()) {
                try {
                    sendMessage(title, body, token, url);
                } catch (FirebaseMessagingException e) {
                    if (isInvalidTokenError(e)) {
                        user.setFcmToken(null);
                        log.warn("Removed invalid token for user: {}", user.getId());
                    }
                }
            }
        });
        long endTime = System.currentTimeMillis(); // 종료 시간 기록
        log.info("=== 발송 완료! 총 소요 시간: {}ms ({}초) ===",
                (endTime - startTime), (endTime - startTime) / 1000.0);
    }

    public void sendMessage(String title, String body, String fcmToken, String url) throws FirebaseMessagingException {
        Message message = Message.builder()
                .setToken(fcmToken)
                .putData("title", title)
                .putData("body", body)
                .putData("url", url)
                .build();

        FirebaseMessaging.getInstance().send(message,true);
    }

    private boolean isInvalidTokenError(FirebaseMessagingException e) {
        MessagingErrorCode code = e.getMessagingErrorCode();
        return code == MessagingErrorCode.INVALID_ARGUMENT || code == MessagingErrorCode.UNREGISTERED;
    }
}