package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.dto.OpinionUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.service.OpinionService;
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
    //의견등록
    @PostMapping
    public ResponseEntity<?> createOpinion(@RequestBody OpinionCreateRequestDto requestDto){
        return ResponseEntity.ok(true);
    }


    //특정국회의원 의견게시판 목록 조회
    @GetMapping("/opinions")
    public ResponseEntity<List<OpinionResponseDto>> getOpinions(@RequestParam Integer congress_id) {
        List<OpinionResponseDto> response=opinionService.getOpinions(congress_id);
        return ResponseEntity.ok(response);
    }


    //의견 수정
    @PutMapping("/opinion")
    public ResponseEntity<OpinionResponseDto> putOpinion(@RequestParam Long opinion_id, @RequestBody OpinionUpdateRequestDto requestDto) {
        OpinionResponseDto responseDto=opinionService.update(opinion_id,requestDto);
        return ResponseEntity.ok(responseDto);
    }

    //의견 삭제
    @DeleteMapping
    public ResponseEntity<String> delete(@RequestParam Long opinion_id) {
        boolean isDeleted = opinionService.deleteOpinion(opinion_id);

        if (isDeleted) {
            return ResponseEntity.ok("삭제 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("삭제 실패: 게시글을 찾을 수 없습니다.");
        }
    }



} //class end
