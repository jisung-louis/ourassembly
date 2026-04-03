
package com.team3.ourassembly.domain.community.reply.entity;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.reply.dto.ReplyResponseDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reply")
public class ReplyEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long replyID;

    @Column(name = "content")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private BoardEntity board;

    public ReplyResponseDto toDto(){
        return ReplyResponseDto.builder()
                .replyID(replyID)
                .content(content)
                .userId(user.getId())
                .boardId(board.getBoard_id())
                .createDate(getCreatedAt().toString())
                .updateDate(getUpdatedAt().toString())
                .build();
    }

}
