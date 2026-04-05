package com.team3.ourassembly.domain.bill.dto;

import com.team3.ourassembly.domain.bill.entity.BillSummaryStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillSummaryResponse {
    private String billId;
    private String summary;
    private BillSummaryStatus summaryStatus;
}
