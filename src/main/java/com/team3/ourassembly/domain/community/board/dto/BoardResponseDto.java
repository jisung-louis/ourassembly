package com.team3.ourassembly.domain.community.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponseDto {

    private Long boardId;
    private String title;
    private String content;
    private int viewCount;
    private int likeCount;
    private boolean isRewarded;
    private String createAt;
    private String updateAt;
    private String userName;
    private String district;
}
