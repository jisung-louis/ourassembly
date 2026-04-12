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
public class CommunityDto {
    // 지역별 게시글 분포 TOP5
    private List<Map<String, Object>> topDistricts;
    // 좋아요 많은 게시글 TOP5
    private List<Map<String, Object>> topBoards;
}