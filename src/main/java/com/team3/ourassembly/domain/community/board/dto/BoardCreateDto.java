package com.team3.ourassembly.domain.community.board.dto;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardCreateDto {
    private String title;
    private String content;
    private String district;

    public BoardEntity toEntity(UserEntity user) {
        return BoardEntity.builder()
                .title(this.title)
                .content(this.content)
                .user(user)
                .district(district)
                .build();
    }

}
