package com.team3.ourassembly.domain.user.controller;

import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.domain.user.service.MailService;
import com.team3.ourassembly.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<String> requestVerify(@RequestParam String email) {
        mailService.newCertify(email);
        return ResponseEntity.ok("인증 메일이 발송되었습니다.");
    }

    // 인증번호 확인 API
    @PostMapping("/emailcheck")
    public ResponseEntity<String> checkVerify(@RequestParam String email, @RequestParam String code) {
        if (mailService.verifyCode(email, code)) {
            return ResponseEntity.ok("인증에 성공하였습니다.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증 번호가 일치하지 않거나 만료되었습니다.");
    }



    @PostMapping("/sign")
    public ResponseEntity<?> sign(@RequestBody UserDto userDto){
        userService.sign(userDto);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto userDto){
        UserDto loginUser = userService.login(userDto);
        return ResponseEntity.ok(loginUser);
    }

}
