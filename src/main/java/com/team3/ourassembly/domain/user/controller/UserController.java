package com.team3.ourassembly.domain.user.controller;

import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.domain.user.service.MailService;
import com.team3.ourassembly.domain.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.aspectj.apache.bcel.classfile.Code;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final MailService mailService;

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
    public ResponseEntity<?> login(@RequestBody UserDto loginDto , HttpSession session){
        UserDto result = userService.login(loginDto);
        session.setAttribute("loginId" , result.getId());
        return ResponseEntity.ok("로그인 성공");
    }

}
