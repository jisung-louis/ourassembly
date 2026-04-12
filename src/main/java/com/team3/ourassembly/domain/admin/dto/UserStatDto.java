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
public class UserStatDto {
    // 최근 가입 회원 5명
    private List<Map<String, Object>> recentUsers;
    // 게시글 많이 쓴 유저 TOP5
    private List<Map<String, Object>> topBoardUsers;
}