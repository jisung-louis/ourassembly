package com.team3.ourassembly.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpinionStatDto {
    // 전체 의견수
    private Long totalOpinions;
    // 답변 대기 의견수
    private Long pendingOpinions;
    // 답변 완료 의견수
    private Long answeredOpinions;
    // 의견 많이 받은 국회의원 TOP5
    private List<Map<String, Object>> topCongressmanByOpinion;
}