package com.team3.ourassembly.domain.opinion.dto.answer;


import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerCreateRequestDto { //
    private Long opinionId; //답변을 달 의견글번호
    private String content; //답변 내용
    private boolean isDirect; //국회의원 답변 여부


    //dto->entity로 변환
    public AnswerEntity toEntity() {
        return AnswerEntity.builder()
                .content(content) //내용 저장
                .isDirect(isDirect) //국회의원 답변 여부 저장
                .build();
    }
}
