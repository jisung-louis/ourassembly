package com.team3.ourassembly.domain.alarm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component; // 추가

import jakarta.annotation.PostConstruct; // javax가 아니라 jakarta일 수 있음 (스프링 버전 확인)
import java.io.FileInputStream;

@Configuration
@Component // 스프링이 강제로 읽게 추가
public class FireBaseConfig {

    @PostConstruct
    public void init() {
        System.out.println("======= Firebase 초기화 시작 =======");
        try {
            // 찾아내신 절대 경로를 그대로 넣습니다. (역슬래시 두 번 주의!)
            FileInputStream serviceAccount =
                    new FileInputStream("C:\\Users\\sku-102-17\\Desktop\\ourassembly\\src\\main\\resources\\firebase\\FirebaseKey.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ [성공] Firebase DEFAULT 앱이 초기화되었습니다!");
            }
        } catch (Exception e) {
            System.out.println("❌ [실패] 여전히 파일을 못 찾거나 에러가 발생함:");
            e.printStackTrace();
        }
    }
}