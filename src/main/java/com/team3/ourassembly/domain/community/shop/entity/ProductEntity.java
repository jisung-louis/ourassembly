package com.team3.ourassembly.domain.community.shop.entity;

import com.team3.ourassembly.domain.community.shop.dto.ProductDto;
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
@Table(name = "product")
public class ProductEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(name = "name" , nullable = false)
    private String name;

    @Column(name = "image_url" ,nullable = false)
    private String imageUrl;

    @Column(name = "price" , columnDefinition = "int" , nullable = false)
    private int price;


    public ProductDto toDto(){
        return ProductDto.builder()
                .productId(productId)
                .name(name)
                .imageUrl(imageUrl)
                .price(price)
                .createDate(getCreatedAt().toString())
                .updateDate(getUpdatedAt().toString())
                .build();
    }
}
