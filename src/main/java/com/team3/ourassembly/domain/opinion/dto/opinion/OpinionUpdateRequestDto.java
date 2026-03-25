package com.team3.ourassembly.domain.opinion.dto.opinion;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpinionUpdateRequestDto { //게시글 수정 요청 DTO
    private String title;
    private String content;
}
