package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmService {



    public String sendNotification(String fcmToken, String title, String body) {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setNotification(notification)
                .setToken(fcmToken)
                .putData("title", title)
                .putData("body", body)
                .build();


        try {
            return FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {

            String errorCode = e.getMessagingErrorCode().toString();
            System.err.println("FCM 발송 실패 (에러코드: " + errorCode + "): " + e.getMessage());

            return errorCode;
        } catch (Exception e) {
            System.err.println("알 수 없는 FCM 오류: " + e.getMessage());
            return "UNKNOWN_ERROR";
        }
    }
}
