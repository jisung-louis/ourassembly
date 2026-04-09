package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class NotificationController {
    private final FcmService fcmService;


    @GetMapping("/send")
    public String sendNotification(@RequestParam String token,@RequestParam String title,@RequestParam String body) {

        try{
            fcmService.sendNotification(token, title, body);
            return "Notificaion sent successfully";
        }catch (Exception e){
            e.printStackTrace();
            return "Falied";
        }
    }
}
