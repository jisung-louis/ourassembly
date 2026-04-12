package com.team3.ourassembly.domain.alarm.service;

import com.google.firebase.messaging.*;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmService {



    public String sendNotification(String fcmToken, String title, String body,String url) {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setToken(fcmToken)
                .putData("title", title)
                .putData("body", body)
                .putData("url",url)
                .build();


        try {
            String result = FirebaseMessaging.getInstance().send(message);
            System.out.println("FCM 발송 성공: " + result);
            return result;
        } catch (FirebaseMessagingException e) {
            String errorCode = e.getMessagingErrorCode().toString();
            System.err.println("FCM 발송 실패 (에러코드: " + errorCode + "): " + e.getMessage());
            return errorCode;
        }

    }
}
