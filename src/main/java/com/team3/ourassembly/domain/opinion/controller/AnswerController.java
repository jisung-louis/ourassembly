package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.service.AnswerService;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/answer")
public class AnswerController {
    private final AnswerService answerService;
    private final JwtService jwtService;


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

        Long userId = jwtDto.getId();
        String role=jwtDto.getRole();
        if (userId == null || !"congress".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        createRequestDto.setOpinionId(opinion_id);

        return ResponseEntity.ok(answerService.createAnswer(createRequestDto, userId));
    }

    //답변 수정
    @PutMapping("/{id}")
    public ResponseEntity<AnswerResponseDto> updateAnswer(
            @PathVariable Long id,
            @RequestBody AnswerUpdateRequestDto updateRequestDto,
            @RequestHeader("Authorization") String token
    ) {
        // 1. 토큰 검증
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. JWT 파싱
        JwtDto jwtDto = jwtService.getClaim(pureToken);
        Long userId = jwtDto.getId();
        String role = jwtDto.getRole();

        // 4. 권한 체크
        if (userId == null || !"congress".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 5. 서비스 호출
        AnswerResponseDto response =
                answerService.updateAnswer(id, updateRequestDto, userId);

        return ResponseEntity.ok(response);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAnswer(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        // 1. 토큰 검증
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. JWT 파싱
        JwtDto jwtDto = jwtService.getClaim(pureToken);
        Long userId = jwtDto.getId();
        String role = jwtDto.getRole();

        // 4. 권한 체크
        if (userId == null || !"congress".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 5. 삭제
        answerService.deleteAnswer(id, userId);

        return ResponseEntity.ok("삭제 성공");
    }




} //class end
