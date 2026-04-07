package com.team3.ourassembly.domain.bill.dto;

import com.team3.ourassembly.domain.bill.entity.BillResult;
import com.team3.ourassembly.domain.bill.entity.BillSummaryStatus;
import com.team3.ourassembly.domain.bill.entity.BillStage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BillDetailResponse {
    private String billId;
    private String billNo;
    private String billName;
    private LocalDate proposeDate;
    private String committeeName;
    private String detailLink;

    private LocalDate committeeReferredDate;
    private LocalDate committeePresentedDate;
    private LocalDate committeeProcessedDate;
    private String committeeProcessResult;

    private LocalDate lawReferredDate;
    private LocalDate lawPresentedDate;
    private LocalDate lawProcessedDate;
    private String lawProcessResult;

    private LocalDate plenaryPresentedDate;
    private LocalDate plenaryResolvedDate;
    private String plenaryConferenceName;
    private String plenaryResult;

    private LocalDate governmentTransferDate;
    private String promulgationLawName;
    private LocalDate promulgationDate;
    private String promulgationNo;

    private BillStage currentStage;
    private BillResult currentResult;
    private List<BillProposerResponse> proposers;

    private String summary;
    private BillSummaryStatus summaryStatus;
}
