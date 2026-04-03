package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.service.FollowService;
import com.team3.ourassembly.domain.user.service.UserService;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follow")
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class FollowController {
    private final UserService userService;
    private final FollowService followService;
    private final JwtService jwtService;

    /*
    팔로우 하기 기능
     */
    @PostMapping("/{congressmanId}")
    public ResponseEntity<?> follow(@RequestHeader("Authorization") String token, @PathVariable Long congressmanId){
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        JwtDto jwtDto= jwtService.getClaim(pureToken);

        Long userId = jwtDto.getId();
        String role=jwtDto.getRole();
        try {
            followService.follow(userId, congressmanId);
            return ResponseEntity.ok("팔로우 성공");
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }//func end


    // 언팔로우
    @DeleteMapping("/{congressmanId}")
    public ResponseEntity<?> unfollow(
            @RequestHeader("Authorization") String token,
            @PathVariable Long congressmanId
    ) {
        String pureToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(pureToken);

        Long userId = jwtDto.getId();
        String role=jwtDto.getRole();

        followService.unfollow(userId,congressmanId);
        return ResponseEntity.ok("언팔로우 성공");
    }

    // 내 팔로우 목록 조회
    @GetMapping
    public ResponseEntity<?> getFollowList(
            @RequestHeader("Authorization") String token
    ) {
        String pureToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(pureToken);

        Long userId = jwtDto.getId();
        String role=jwtDto.getRole();

        return ResponseEntity.ok(followService.getMyFollowingList(userId));
    }


}
