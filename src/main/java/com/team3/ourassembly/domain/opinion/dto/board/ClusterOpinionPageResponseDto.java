package com.team3.ourassembly.domain.opinion.dto.board;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClusterOpinionPageResponseDto {
    private int page;
    private int size;
    private long totalCount;
    private boolean hasNext;
    private List<BoardItemResponseDto> items;
}
