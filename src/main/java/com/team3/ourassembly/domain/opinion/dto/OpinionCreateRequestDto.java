package com.team3.ourassembly.domain.opinion.dto;


import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//클라이언트로부터 의견 작성 요청DTO
@Getter
@Setter
@NoArgsConstructor
public class OpinionCreateRequestDto {
    private String title;
    private String content;
//    private Integer congressman_id;

    //dto->entity로 변환
    public OpinionEntity ToEntity() {
        return OpinionEntity.builder()
                .title(title)
                .content(content)
                .build();
    } //toentity() end

} //class end
