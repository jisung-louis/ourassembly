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
public class PointStatDto {
    // 포인트 총 발행량
    private Long totalPointIssued;
    // 포인트 총 사용량
    private Long totalPointUsed;
    // 최근 포인트 내역 5건
    private List<Map<String, Object>> recentPoints;
}