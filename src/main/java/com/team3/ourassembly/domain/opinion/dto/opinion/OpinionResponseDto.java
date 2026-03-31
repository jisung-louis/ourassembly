package com.team3.ourassembly.domain.opinion.dto.opinion;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OpinionResponseDto { //게시물 응답 DTO
    private Long id; //게시물 번호
    private String title; //글 제목
    private String content; //글 내용
    private Integer likeCount; //공감수
    private Integer viewCount; //조회수
    private String status; //답변 상태 ex)답변 대기,답변완료
    private LocalDateTime createdAt; //작성일자
    private String name; //유저이름
    private AnswerResponseDto answer;

} //class end
