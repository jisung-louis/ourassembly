package com.team3.ourassembly.domain.opinion.dto.opinion;


import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//클라이언트로부터 의견 작성 요청DTO
@Getter
@Setter
@NoArgsConstructor
public class OpinionCreateRequestDto { //의견 등록 요청 DTO

    private String title; //글 제목
    private String content; //글 내용
    private String congressmanId; //국회의원 번호(FK)

    //dto->entity로 변환
    public OpinionEntity ToEntity() {
        return OpinionEntity.builder()
                .title(title)
                .content(content)
                .build();
    } //func end

} //class end
