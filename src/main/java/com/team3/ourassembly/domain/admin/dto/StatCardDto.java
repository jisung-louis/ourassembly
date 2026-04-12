package com.team3.ourassembly.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatCardDto {
    private Long totalUsers;
    private Long totalBoards;
    private Long totalReplies;
    private Long totalPointIssued;
    private Long totalPointUsed;
    private Long todayBoards;
    private Long todayReplies;
}