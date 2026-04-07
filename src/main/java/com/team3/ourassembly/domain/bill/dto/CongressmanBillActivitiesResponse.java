package com.team3.ourassembly.domain.bill.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CongressmanBillActivitiesResponse {
    private Integer leadCount;
    private Integer coCount;
    private List<CongressmanBillItemResponse> leadBills;
    private List<CongressmanBillItemResponse> coBills;
}
