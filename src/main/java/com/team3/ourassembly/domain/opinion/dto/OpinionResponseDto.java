package com.team3.ourassembly.domain.opinion.dto;

import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
//게시물 응답DTO
public class OpinionResponseDto {
    private Long opinion_id; //게시물 번호
    private String title; //글 제목
    private String content; //글 내용
    private Integer likeCount; //공감수
    private Integer viewCount; //조회수
    private String status; //답변 상태 ex)답변 대기,답변완료
    private LocalDateTime createdAt; //작성일자
    private String name; //유저이름



    // Entity → DTO 변환
    public static OpinionResponseDto toDto(OpinionEntity opinion) {
        return OpinionResponseDto.builder()
                .opinion_id(opinion.getOpinion_id())
                .title(opinion.getTitle())
                .content(opinion.getContent())
                .likeCount(opinion.getLike_count())
                .viewCount(opinion.getView_count())
                .status(opinion.getStatus())
                .name(opinion.getUserEntity().getName())
                .createdAt(opinion.getCreatedAt())
                .build();
    }
}

