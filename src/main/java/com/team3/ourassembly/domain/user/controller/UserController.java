package com.team3.ourassembly.domain.user.controller;

import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.community.reply.dto.ReplyResponseDto;
import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import com.team3.ourassembly.domain.user.service.MailService;
import com.team3.ourassembly.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class UserController {
    private final UserService userService;
    private final MailService mailService;
    private final JwtService jwtService;

    // 인증번호 발송 API
    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestParam String email) {
        mailService.sendEmail(email);
        return ResponseEntity.ok("인증 메일이 발송되었습니다.");
    }

    // 인증번호 확인 API
    @PostMapping("/emailcheck")
    public ResponseEntity<?> checkVerify(@RequestParam String email, @RequestParam String code) {
        mailService.verifyCode(email , code);
        return ResponseEntity.ok("인증 성공");
    }


    // 회원가입
    @PostMapping("/sign")
    public ResponseEntity<?> sign(@RequestBody UserDto userDto){
        userService.sign(userDto);
        return ResponseEntity.ok("회원가입 성공");
    }


    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto loginDto){

        UserDto result = userService.login(loginDto);
        System.out.println("result = " + result);
        String token = jwtService.createToken(result.getId() , result.getRole(), result.getCongressmanId());
        return ResponseEntity.ok().header("Authorization" , "Bearer "+token).body(result);

    }

    //마이페이지
    @GetMapping("/myinfo")
    public ResponseEntity<?> myInfo(@RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String inToken = token.replace("Bearer ", "");

        JwtDto jwtDto = jwtService.getClaim(inToken);

        if(jwtDto==null){
            return ResponseEntity.status(500).body("");
        }
        Long loginId = jwtDto.getId();
        return ResponseEntity.ok(userService.myInfo(loginId));
    }


    //내가 쓴 게시물 조회
    @GetMapping("/myboard")
    public ResponseEntity<?> myBoard(@RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtDto.getId();

        List<BoardResponseDto> myboard = userService.myBoard(userId);
        if(myboard==null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(myboard);
    }

    //내가 쓴 댓글 조회
    @GetMapping("/myreply")
    public ResponseEntity<?> myreply(@RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtDto.getId();

        List<ReplyResponseDto> myreply = userService.myReply(userId);
        if(myreply==null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(myreply);
    }

}
