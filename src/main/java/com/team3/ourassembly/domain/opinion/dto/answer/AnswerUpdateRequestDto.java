package com.team3.ourassembly.domain.opinion.dto.answer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//답변 아이디,내용,국회의원 본인 여부를 담아서 수정 요청
public class AnswerUpdateRequestDto {
   private Long id; //답변 번호
   private String content; //답변 내용
   private boolean isDirect; //국회의원 여부
}
