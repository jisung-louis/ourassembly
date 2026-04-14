package com.team3.ourassembly.domain.alarm.controller;

import com.team3.ourassembly.domain.alarm.service.FollowService;
import com.team3.ourassembly.domain.user.service.UserService;
import com.team3.ourassembly.global.aop.Token;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follow")
public class FollowController {
    private final UserService userService;
    private final FollowService followService;
    private final JwtService jwtService;

    /*
    팔로우 하기 기능
     */
    @PostMapping("/{congressmanId}")
    @Token
    public ResponseEntity<?> follow(HttpServletRequest request, @PathVariable String congressmanId){
        Long userId = (Long) request.getAttribute("userId");
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
            @PathVariable String congressmanId
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
