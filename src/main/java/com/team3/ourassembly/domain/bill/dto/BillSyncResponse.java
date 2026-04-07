package com.team3.ourassembly.domain.bill.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillSyncResponse {
    private Integer age;
    private Integer billCount;
    private Integer detailUpdatedCount;
    private Integer proposerMappingCount;
    private String triggeredBy;
}
