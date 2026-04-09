package com.team3.ourassembly.domain.opinion.dto.board;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BoardResponseDto {
    private String boardMode; // LIST / CLUSTER
    private boolean updating;
    private int clusterCount;
    private int opinionCount;
    private int myOpinionCount;
    private List<BoardItemResponseDto> clusterItems;
    private List<BoardItemResponseDto> opinionItems;
    private List<BoardItemResponseDto> myOpinionItems;
}
