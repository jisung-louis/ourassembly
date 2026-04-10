package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.dto.NotificationResponseDto;
import com.team3.ourassembly.domain.alarm.service.NotificationService;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/notification")
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    // 안읽은 알림 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.getClaim(token.replace("Bearer ", "")).getId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // 알림 목록
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.getClaim(token.replace("Bearer ", "")).getId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    // 전체 읽음 처리
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.getClaim(token.replace("Bearer ", "")).getId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }



    // 개별 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.getClaim(token.replace("Bearer ", "")).getId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        notificationService.deleteOne(id, userId);
        return ResponseEntity.ok().build();
    }

    // 전체 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.getClaim(token.replace("Bearer ", "")).getId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        notificationService.deleteAll(userId);
        return ResponseEntity.ok().build();
    }
}