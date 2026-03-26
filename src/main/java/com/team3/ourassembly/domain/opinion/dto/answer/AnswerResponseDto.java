package com.team3.ourassembly.domain.opinion.dto.answer;

import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponseDto {
    private Long id;    // 답변 번호
    private String content;    // 답변 내용
    private String name;   // 작성자 이름(국회의원)
    private boolean isDirect; // 국회의원이 직접 작성했는지 여부
    private LocalDateTime createdAt; // 작성 시간


    } //class end