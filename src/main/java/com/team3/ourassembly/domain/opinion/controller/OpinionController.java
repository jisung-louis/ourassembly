package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.service.OpinionService;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionUpdateRequestDto;
import com.team3.ourassembly.domain.user.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/opinion")
public class OpinionController {
    private final OpinionService opinionService;
    private final JwtService jwtService;



    //의견등록:C
    @PostMapping
    public ResponseEntity<OpinionResponseDto> createOpinion(@RequestBody OpinionCreateRequestDto requestDto
            ,@RequestHeader("Authorization") String token){
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        String loginId = jwtService.getClaim(pureToken);
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 4. 서비스 호출
        OpinionResponseDto response = opinionService.create(requestDto, loginId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    } //method end



    //의견 수정:U
    @PutMapping
    public ResponseEntity<OpinionResponseDto> putOpinion(@RequestParam Long opinion_id,@RequestBody OpinionUpdateRequestDto requestDto
    ,@RequestHeader("Authorization") String token) {
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        String loginId = jwtService.getClaim(pureToken);
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        OpinionResponseDto responseDto=opinionService.update(opinion_id,requestDto,loginId);
        return ResponseEntity.ok(responseDto);
    }

    //의견 삭제:D
    @DeleteMapping
    public ResponseEntity<String> delete(@RequestParam Long opinion_id,@RequestHeader("Authorization") String token) {
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        String loginId = jwtService.getClaim(pureToken);
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isDeleted = opinionService.delete(opinion_id,loginId);

        if (isDeleted) {
            return ResponseEntity.ok("삭제 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("삭제 실패: 게시글을 찾을 수 없습니다.");
        }
    } //method end




    //특정국회의원 의견게시판 목록 조회:R
    @GetMapping("/opinions")
    public ResponseEntity<List<OpinionResponseDto>> getOpinions(@RequestParam Long id) {

        List<OpinionResponseDto> response=opinionService.getOpinions(id);
        return ResponseEntity.ok(response);
    } //method end

} //class end
