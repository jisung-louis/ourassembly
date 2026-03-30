package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.service.AnswerService;
import com.team3.ourassembly.domain.user.service.JwtDto;
import com.team3.ourassembly.domain.user.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/answer")
public class AnswerController {
    private AnswerService answerService;
    private JwtService jwtService;


    @PostMapping
    public ResponseEntity<AnswerResponseDto> createAnswer(
            @RequestParam Long opinion_id,
            @RequestBody AnswerCreateRequestDto createRequestDto
            ,@RequestHeader("Authorization") String token
    ) {
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        JwtDto jwtDto= jwtService.getClaim(pureToken);

        String role=jwtDto.getRole();
        if (role== null||role!="congress") {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(answerService.createAnswer(createRequestDto,role));
    }

    //답변 수정
    @PutMapping
    public ResponseEntity<AnswerResponseDto> updateAnswer(@RequestBody AnswerUpdateRequestDto dto){
        //로그인 세션부분 병합하면 구현

        return ResponseEntity.ok(answerService.updateAnswer(dto));
    } //method end



    //***답변 삭제***//
    @DeleteMapping
    public ResponseEntity<String> delete(@RequestParam Long answer_id) {
        answerService.deleteAnswer(answer_id);
        return ResponseEntity.ok("삭제 성공");
    } //method end





} //class end
