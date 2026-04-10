package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmService {
    // 알림 발송
    public String sendNotification(String fcmToken, String title, String body){
        Notification notification= Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message=Message.builder()
                .setToken(fcmToken)
                .putData("title", title)
                .putData("body", body)
                .build();


        try {
            return FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode().equals(MessagingErrorCode.INVALID_ARGUMENT)) {
                // 토큰이 유효하지 않은 경우, 오류 코드를 반환
                return e.getMessagingErrorCode().toString();
            } else if (e.getMessagingErrorCode().equals(MessagingErrorCode.UNREGISTERED)) {
                // 재발급된 이전 토큰인 경우, 오류 코드를 반환
                return e.getMessagingErrorCode().toString();
            }
            else { // 그 외, 오류는 런타임 예외로 처리
                throw new RuntimeException(e);
            }
        }

    }

}
