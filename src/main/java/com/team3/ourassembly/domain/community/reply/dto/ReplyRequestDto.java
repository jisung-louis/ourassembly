package com.team3.ourassembly.domain.community.reply.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyRequestDto {
    private Long replyId;
    private Long boardId;
    private String content;
}
