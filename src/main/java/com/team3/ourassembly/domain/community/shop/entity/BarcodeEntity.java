package com.team3.ourassembly.domain.community.shop.entity;

import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.apachecommons.CommonsLog;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "barcode")
public class BarcodeEntity extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long barcodeId;

    @Column(name = "barcode_no" , nullable = false , unique = true)
    private String barcodeNo;

    @Column(name = "qr_image_path")
    private String qrImagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id" , nullable = false)
    private ProductEntity product;

    public BarcodeResponseDto toDto(){
        return BarcodeResponseDto.builder()
                .barcodeNo(barcodeNo)
                .productId(product.getProductId())
                .userId(user != null ? user.getId() : null)
                .barcodeId(barcodeId)
                .qrImagePath(qrImagePath)
                .productName(product.getName())
                .imageUrl(product.getImageUrl())
                .createDate(getCreatedAt().toString())
                .updateDate(getUpdatedAt().toString())
                .build();
    }
}
