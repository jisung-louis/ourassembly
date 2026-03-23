package com.team3.ourassembly.domain.opinion.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpinionUpdateRequestDto {
    private String title;
    private String content;
}
