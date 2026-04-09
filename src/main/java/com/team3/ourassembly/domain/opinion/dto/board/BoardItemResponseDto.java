package com.team3.ourassembly.domain.opinion.dto.board;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BoardItemResponseDto {
    private String type; // OPINION / CLUSTER
    private Long id;
    private String title;
    private String content;
    private Integer likeCount;
    private Integer viewCount;
    private String status;
    private LocalDateTime createdAt;
    private String name;
    private AnswerResponseDto answer;
    private Integer opinionCount;
}
