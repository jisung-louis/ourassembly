package com.team3.ourassembly.domain.congress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CongressmanSummaryResponse {
    private Long congressmanId;
    private String congressmanName;
    private String congressmanPhotoUrl;
    private String congressmanParty;
    private String congressmanWard;
}
