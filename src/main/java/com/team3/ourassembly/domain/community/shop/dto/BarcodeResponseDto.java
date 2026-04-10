package com.team3.ourassembly.domain.community.shop.dto;

import com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeResponseDto {
    private Long barcodeId;
    private String barcodeNo;
    private String qrImagePath;
    private Long userId;
    private Long productId;
    private Integer stock;
    private String productName;
    private String imageUrl;
    private String createDate;
    private String updateDate;

    public BarcodeEntity toEntity(){
        return BarcodeEntity.builder()
                .barcodeNo(barcodeNo)
                .qrImagePath(qrImagePath)
                .build();
    }
}
