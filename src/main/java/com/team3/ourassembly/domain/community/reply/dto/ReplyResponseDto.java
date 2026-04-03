package com.team3.ourassembly.domain.community.reply.dto;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReplyResponseDto {

    private Long replyID;
    private String content;
    private Long userId;
    private Long boardId;
    private String createDate;
    private String updateDate;


    public ReplyEntity toEntity(){
        return ReplyEntity.builder()
                .replyID(replyID)
                .content(content)
                .build();
    }
}
