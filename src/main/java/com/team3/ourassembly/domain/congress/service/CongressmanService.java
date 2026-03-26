package com.team3.ourassembly.domain.congress.service;

import com.team3.ourassembly.domain.congress.dto.CongressmanDetailResponse;
import com.team3.ourassembly.domain.congress.dto.CongressmanSummaryResponse;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CongressmanService {
    private final CongressmanRepository congressmanRepository;

    public CongressmanDetailResponse getCongressmanDetail(Long congressmanId){
        CongressmanEntity congressmanEntity = congressmanRepository.findById(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException(congressmanId + "번 국회의원을 찾을 수 없습니다."));

        return congressmanEntity.toDto();
    }

    public List<CongressmanSummaryResponse> getCongressmenByName(String name){
        List<CongressmanEntity> congressmanEntity = congressmanRepository.findByName(name);
        List<CongressmanSummaryResponse> congressmanSummaryResponseList = new ArrayList<>();
        congressmanEntity.forEach(congressman -> {
            CongressmanSummaryResponse summaryDto = congressman.toSummaryDto();
            congressmanSummaryResponseList.add(summaryDto);
        });
        return congressmanSummaryResponseList;
    }
}
