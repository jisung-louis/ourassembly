package com.team3.ourassembly.domain.opinion.dto.opinion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpinionSimilarityCheckRequestDto {
    private String congressmanId;
    private String title;
    private String content;
}
