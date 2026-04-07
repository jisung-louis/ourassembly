package com.team3.ourassembly.domain.community.point.service;

import com.team3.ourassembly.domain.community.point.entity.PointEntity;
import com.team3.ourassembly.domain.community.point.repository.PointRepository;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity;
import com.team3.ourassembly.domain.community.shop.entity.ProductEntity;
import com.team3.ourassembly.domain.community.shop.repository.BarcodeRepository;
import com.team3.ourassembly.domain.community.shop.repository.ProductRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class PointService {
    private final PointRepository pointRepository;
    private final ProductRepository productRepository;
    private final BarcodeRepository barcodeRepository;
    private final UserRepository userRepository;


    public BarcodeResponseDto buy(Long productId, Long userId) {
        // 1. 상품 조회
        Optional<ProductEntity> productOptional = productRepository.findById(productId);
        if (!productOptional.isPresent()) return null;
        ProductEntity product = productOptional.get();

        // 2. 유저 조회
        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) return null;
        UserEntity user = userOptional.get();

        // 3. 포인트 잔액 조회 및 체크
        Integer currentPoint = pointRepository.sumPointByUserId(userId);
        if (currentPoint < product.getPrice()) return null;

        // 4. 바코드 재고 조회
        Optional<BarcodeEntity> barcodeOptional = barcodeRepository.findAvailableBarcode(productId);
        if (!barcodeOptional.isPresent()) return null;
        BarcodeEntity barcode = barcodeOptional.get();

        // 5. 바코드 유저 할당
        barcode.setUser(user);
        barcodeRepository.save(barcode);

        // 6. 포인트 차감 로그
        pointRepository.save(PointEntity.builder()
                .changeVal(-product.getPrice())
                .reason(4)
                .user(user)
                .build());

        // 7. 바코드 반환
        return barcode.toDto();
    }
}
