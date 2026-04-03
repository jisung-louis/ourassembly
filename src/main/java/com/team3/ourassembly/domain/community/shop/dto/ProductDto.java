package com.team3.ourassembly.domain.community.shop.dto;

import com.team3.ourassembly.domain.community.shop.entity.ProductEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDto {
    private Long productId;
    private String name;
    private String imageUrl;
    private int price;
    private int stock;
    private String createDate;
    private String updateDate;

    public ProductEntity toEntity(){
        return ProductEntity.builder()
                .productId(productId)
                .name(name)
                .imageUrl(imageUrl)
                .price(price)
                .stock(stock)
                .build();
    }
}
