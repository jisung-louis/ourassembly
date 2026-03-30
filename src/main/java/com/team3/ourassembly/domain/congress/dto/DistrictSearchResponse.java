package com.team3.ourassembly.domain.congress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class DistrictSearchResponse {
    private Long id;
    private String address1;
    private String address2;
    private String address3;
    private String fullAddress;
    private Long congressmanId;
    private String congressmanName;
    private String congressmanParty;
    private String congressmanWard;
}
