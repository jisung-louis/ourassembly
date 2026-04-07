package com.team3.ourassembly.domain.congress.dto;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class DistrictResponse{
    private Long id;
    private String address1; // 시/도
    private String address2; // 시/군/구
    private String address3; // 읍/면/동
    private String congressmanId;
    private String congressmanName;
    private String congressmanPhotoUrl;
    private String congressmanParty;
    private String congressmanWard;
}
