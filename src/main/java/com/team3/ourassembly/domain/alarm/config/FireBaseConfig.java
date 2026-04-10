package com.team3.ourassembly.domain.alarm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component; // 추가

import jakarta.annotation.PostConstruct; // javax가 아니라 jakarta일 수 있음 (스프링 버전 확인)
import java.io.FileInputStream;

@Configuration
@Component
public class FireBaseConfig {

    @PostConstruct
    public void init() {
        try {
            FileInputStream serviceAccount =
                    new FileInputStream("C:\\Users\\sku-102-17\\Desktop\\ourassembly\\src\\main\\resources\\firebase\\FirebaseKey.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}