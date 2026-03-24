package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/answer")
public class AnswerController {
    private AnswerService answerService;
    //답변 등록
    @PostMapping
    public ResponseEntity<AnswerResponseDto> createAnswer(@RequestParam Long opinion_id
            ,@RequestBody AnswerCreateRequestDto createRequestDto) {
        //1.세션에서 로그인한 국회의원 id 추출
        //2.로그인 체크(국회의원이 아니면) 에러
        //3.서비스 로직 호출
    } //method end

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
