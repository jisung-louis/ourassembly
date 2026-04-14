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
        try {
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

            try {
                barcode.setUser(user);
                barcodeRepository.save(barcode);

            } catch (Exception e) {
                // 낙관적 락 충돌 시 다른 바코드로 재시도
                Optional<BarcodeEntity> retry = barcodeRepository.findAvailableBarcode(productId);
                if (!retry.isPresent()) return null;
                BarcodeEntity retryBarcode = retry.get();
                retryBarcode.setUser(user);
                barcodeRepository.save(retryBarcode);
                barcode = retryBarcode;
            }

            pointRepository.save(PointEntity.builder()
                    .changeVal(-product.getPrice())
                    .reason(4)
                    .user(user)
                    .build());

            return barcode.toDto();

        } catch (RuntimeException e) {
            System.out.println("잠시 후 다시 시도해주세요");
        }
        return null;
    }
}
