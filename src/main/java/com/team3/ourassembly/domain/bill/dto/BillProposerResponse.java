package com.team3.ourassembly.domain.bill.dto;

import com.team3.ourassembly.domain.bill.entity.BillProposerRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillProposerResponse {
    private String congressmanId;
    private String name;
    private BillProposerRole role;
    private Integer sortOrder;
}
