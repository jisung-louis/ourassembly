package com.team3.ourassembly.domain.bill.service;

import com.team3.ourassembly.domain.bill.dto.CongressmanBillActivitiesResponse;
import com.team3.ourassembly.domain.bill.dto.CongressmanBillItemResponse;
import com.team3.ourassembly.domain.bill.entity.BillProposerEntity;
import com.team3.ourassembly.domain.bill.entity.BillProposerRole;
import com.team3.ourassembly.domain.bill.repository.BillProposerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BillService {
    private final BillProposerRepository billProposerRepository;

    public CongressmanBillActivitiesResponse getCongressmanBillActivities(String congressmanId) {
        List<BillProposerEntity> mappings =
                billProposerRepository.findByCongressmanIdWithBillOrderByBillProposeDateDescSortOrderAsc(congressmanId);

        List<CongressmanBillItemResponse> leadBills = mappings.stream()
                .filter(mapping -> mapping.getRole() == BillProposerRole.LEAD)
                .map(this::toCongressmanBillItemResponse)
                .toList();

        List<CongressmanBillItemResponse> coBills = mappings.stream()
                .filter(mapping -> mapping.getRole() == BillProposerRole.CO)
                .map(this::toCongressmanBillItemResponse)
                .toList();

        return CongressmanBillActivitiesResponse.builder()
                .leadCount(leadBills.size())
                .coCount(coBills.size())
                .leadBills(leadBills)
                .coBills(coBills)
                .build();
    }

    private CongressmanBillItemResponse toCongressmanBillItemResponse(BillProposerEntity mapping) {
        return CongressmanBillItemResponse.builder()
                .billId(mapping.getBill().getBillId())
                .billNo(mapping.getBill().getBillNo())
                .billName(mapping.getBill().getBillName())
                .proposeDate(mapping.getBill().getProposeDate())
                .committeeName(mapping.getBill().getCommitteeName())
                .currentStage(mapping.getBill().getCurrentStage())
                .currentResult(mapping.getBill().getCurrentResult())
                .role(mapping.getRole())
                .build();
    }
}
