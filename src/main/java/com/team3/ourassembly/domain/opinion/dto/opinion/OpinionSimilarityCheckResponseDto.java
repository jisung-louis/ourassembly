package com.team3.ourassembly.domain.opinion.dto.opinion;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpinionSimilarityCheckResponseDto {
    private boolean matched;
    private int similarityPercent;
    private long daysAgo;
    private Long clusterId;
    private String clusterTitle;
    private String clusterContent;
    private AnswerResponseDto answer;
}
