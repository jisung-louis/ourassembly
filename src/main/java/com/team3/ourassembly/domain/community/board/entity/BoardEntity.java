package com.team3.ourassembly.domain.community.board.entity;

import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "board")
public class BoardEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long board_id;

    @Column(name = "title" , nullable = false)
    private String title;

    @Column(name = "content" , nullable = false , columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "view_count", columnDefinition = "int default 0")
    private int view_count;

    @Column(name = "like_count" , columnDefinition = "int default 0")
    private int like_count;

    @Column(name = "is_rewarded" , columnDefinition = "boolean default false")
    private boolean is_rewarded;

    @Column(name = "district" , nullable = false)
    private String district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id" , nullable = false)
    private UserEntity user;



    public BoardResponseDto toDto() {
        return BoardResponseDto.builder()
                .boardId(this.board_id)
                .title(this.title)
                .content(this.content)
                .viewCount(this.view_count)
                .likeCount(this.like_count)
                .isRewarded(this.is_rewarded)
                .district(this.district)
                .createAt(getCreatedAt().toString())
                .updateAt(getUpdatedAt().toString())
                .userName(getUser().getName())
                .build();
    }


}
