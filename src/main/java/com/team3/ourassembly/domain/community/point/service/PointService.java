package com.team3.ourassembly.domain.community.point.service;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class PointService {

    private final PointTxService pointTxService;  // 별도 클래스 주입

    // 단순히 재시도 담당
    public BarcodeResponseDto buy(Long productId, Long userId) {
        for (int i = 0; i < 3; i++) {
            try {
                return pointTxService.tryBuy(productId, userId);
            } catch (ObjectOptimisticLockingFailureException e) {
                System.out.println("충돌 발생");
            }
        }
        return null;
    }
}

