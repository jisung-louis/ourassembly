package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.service.ClusterAnswerService;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cluster-answer")
@CrossOrigin(origins = "http://localhost:5173")
public class ClusterAnswerController {
    private final ClusterAnswerService clusterAnswerService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<AnswerResponseDto> createAnswer(
            @RequestParam Long cluster_id,
            @RequestBody AnswerCreateRequestDto createRequestDto,
            @RequestHeader("Authorization") String token
    ) {
        JwtDto jwtDto = extractCongressJwt(token);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(clusterAnswerService.createAnswer(cluster_id, createRequestDto, jwtDto.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnswerResponseDto> updateAnswer(
            @PathVariable Long id,
            @RequestBody AnswerUpdateRequestDto updateRequestDto,
            @RequestHeader("Authorization") String token
    ) {
        JwtDto jwtDto = extractCongressJwt(token);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(clusterAnswerService.updateAnswer(id, updateRequestDto, jwtDto.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAnswer(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        JwtDto jwtDto = extractCongressJwt(token);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        clusterAnswerService.deleteAnswer(id, jwtDto.getId());
        return ResponseEntity.ok("삭제 성공");
    }

    private JwtDto extractCongressJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return null;
        }

        String pureToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(pureToken);

        if (jwtDto.getId() == null || !"congress".equals(jwtDto.getRole())) {
            return null;
        }

        return jwtDto;
    }
}
