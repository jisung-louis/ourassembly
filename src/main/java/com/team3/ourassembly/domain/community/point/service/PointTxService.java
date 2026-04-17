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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PointTxService {

    private final PointRepository pointRepository;
    private final ProductRepository productRepository;
    private final BarcodeRepository barcodeRepository;
    private final UserRepository userRepository;

    @Transactional(rollbackFor = Exception.class)
    public BarcodeResponseDto tryBuy(Long productId, Long userId) {

        Optional<ProductEntity> productOptional = productRepository.findById(productId);
        if (!productOptional.isPresent()) return null;
        ProductEntity product = productOptional.get();

        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) return null;
        UserEntity user = userOptional.get();

        Integer currentPoint = pointRepository.sumPointByUserId(userId);
        if (currentPoint == null || currentPoint < product.getPrice()) return null;

        Optional<BarcodeEntity> barcodeOptional = barcodeRepository.findAvailableBarcode(productId);
        if (!barcodeOptional.isPresent()) return null;
        BarcodeEntity barcode = barcodeOptional.get();

        barcode.setUser(user);
        barcodeRepository.save(barcode);

        pointRepository.save(PointEntity.builder()
                .changeVal(-product.getPrice())
                .reason(4)
                .user(user)
                .build());

        return barcode.toDto();
    }
}
