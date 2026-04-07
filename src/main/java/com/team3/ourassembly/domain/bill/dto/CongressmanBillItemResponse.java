package com.team3.ourassembly.domain.bill.dto;

import com.team3.ourassembly.domain.bill.entity.BillResult;
import com.team3.ourassembly.domain.bill.entity.BillStage;
import com.team3.ourassembly.domain.bill.entity.BillProposerRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CongressmanBillItemResponse {
    private String billId;
    private String billNo;
    private String billName;
    private LocalDate proposeDate;
    private String committeeName;
    private BillStage currentStage;
    private BillResult currentResult;
    private BillProposerRole role;
}
