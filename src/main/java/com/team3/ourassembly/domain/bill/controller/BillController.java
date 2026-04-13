package com.team3.ourassembly.domain.bill.controller;

import com.team3.ourassembly.domain.bill.dto.CongressmanBillActivitiesResponse;
import com.team3.ourassembly.domain.bill.dto.BillDetailResponse;
import com.team3.ourassembly.domain.bill.dto.BillSummaryResponse;
import com.team3.ourassembly.domain.bill.dto.BillSyncResponse;
import com.team3.ourassembly.domain.bill.service.BillDataService;
import com.team3.ourassembly.domain.bill.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bill")
public class BillController {
    private final BillDataService billDataService;
    private final BillService billService;

    @PostMapping("/sync")
    public ResponseEntity<BillSyncResponse> syncBills(@RequestParam(defaultValue = "22") Integer age) {
        BillSyncResponse response = billDataService.syncBills(age, "manual");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/detail/{billId}")
    public ResponseEntity<BillDetailResponse> getBillDetail(@PathVariable String billId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(billDataService.getBillDetail(billId));
    }

    @GetMapping("/summary/{billId}")
    public ResponseEntity<BillSummaryResponse> getBillSummary(@PathVariable String billId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(billDataService.getBillSummary(billId));
    }

    @GetMapping("/congressman/{congressmanId}")
    public ResponseEntity<CongressmanBillActivitiesResponse> getCongressmanBills(@PathVariable String congressmanId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(billService.getCongressmanBillActivities(congressmanId));
    }
}
