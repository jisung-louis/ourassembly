package com.team3.ourassembly.domain.community.board.dto;

import com.team3.ourassembly.domain.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardUpdateDto {
    private Long boardId;
    private String title;
    private String content;
    private UserEntity user;
}
