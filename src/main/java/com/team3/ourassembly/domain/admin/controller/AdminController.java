package com.team3.ourassembly.domain.admin.controller;

import com.team3.ourassembly.domain.admin.dto.*;
import com.team3.ourassembly.domain.admin.service.AdminService;
import com.team3.ourassembly.global.aop.Token;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class AdminController {

    private final AdminService adminService;

    // 통계 카드
    @GetMapping("/stats")
    @Token(role = "admin")
    public ResponseEntity<?> getStats() {
        StatCardDto result = adminService.getStats();
        if (result == null) return ResponseEntity.status(500).body("");
        return ResponseEntity.ok(result);
    }

    // 커뮤니티 현황
    @GetMapping("/community")
    @Token(role = "admin")
    public ResponseEntity<?> getCommunity() {
        CommunityDto result = adminService.getCommunity();
        if (result == null) return ResponseEntity.status(500).body("");
        return ResponseEntity.ok(result);
    }

    // 회원 현황
    @GetMapping("/users")
    @Token(role = "admin")
    public ResponseEntity<?> getUsers() {
        UserStatDto result = adminService.getUsers();
        if (result == null) return ResponseEntity.status(500).body("");
        return ResponseEntity.ok(result);
    }

    // 포인트 현황
    @GetMapping("/points")
    @Token(role = "admin")
    public ResponseEntity<?> getPoints() {
        PointStatDto result = adminService.getPoints();
        if (result == null) return ResponseEntity.status(500).body("");
        return ResponseEntity.ok(result);
    }

    // 의견 현황
    @GetMapping("/opinions")
    @Token(role = "admin")
    public ResponseEntity<?> getOpinions() {
        OpinionStatDto result = adminService.getOpinions();
        if (result == null) return ResponseEntity.status(500).body("");
        return ResponseEntity.ok(result);
    }






}
