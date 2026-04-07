package com.team3.ourassembly.domain.community.shop.service;

import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.domain.community.shop.dto.ProductDto;
import com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity;
import com.team3.ourassembly.domain.community.shop.entity.ProductEntity;
import com.team3.ourassembly.domain.community.shop.repository.BarcodeRepository;
import com.team3.ourassembly.domain.community.shop.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ShopService {
    private final ProductRepository productRepository;
    private final BarcodeRepository barcodeRepository;


    //상품 등록
    public ProductDto productPost(ProductDto productDto){
        return productRepository.save(productDto.toEntity()).toDto();
    }

    //상품 전체 조회(페이지 , 가격높은순 ,낮은순 가능)
    public Page<ProductDto> productGet(String sort , int page , int size){

        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<ProductDto> products = null;
        if(sort.equals("priceUp")){
           return productRepository.findAllByOrderByPriceDesc(pageRequest).map(ProductEntity::toDto);
        }else{productRepository.findAllByOrderByPriceAsc(pageRequest).map(ProductEntity::toDto);}

        products.forEach(dto -> dto.setStock(barcodeRepository.countAvailableBarcode(dto.getProductId())));
        return products;
    }

    //상품 상세조회
    public ProductDto productDetail(Long productId) {
        Optional<ProductEntity> optional = productRepository.findById(productId);
        if (!optional.isPresent()) return null;

        ProductDto dto = optional.get().toDto();
        dto.setStock(barcodeRepository.countAvailableBarcode(productId));
        return dto;
    }

    // 상품 정보 수정
    public ProductDto productUpdate(ProductDto productDto){
        Optional<ProductEntity> product = productRepository.findById(productDto.getProductId());
        if(product.isPresent()){
            ProductDto update = product.get().toDto();
            update.setName(productDto.getName());
            update.setPrice(productDto.getPrice());
            update.setStock(productDto.getStock());
            update.setImageUrl(productDto.getImageUrl());
            productRepository.save(update.toEntity());
            return update;
        }
        return null;
    }

    // 상품 삭제
    public boolean productDelete(Long productId){
        Optional<ProductEntity> product = productRepository.findById(productId);
        if(product.isPresent()){
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }

    // 상품 바코드 등록
    public BarcodeResponseDto barcode(BarcodeResponseDto barcode) {
        Optional<ProductEntity> optional = productRepository.findById(barcode.getProductId());
        if (!optional.isPresent()) {
            return null;
        }
        BarcodeEntity barcodeEntity = BarcodeEntity.builder()
                .barcodeNo(barcode.getBarcodeNo())
                .product(optional.get())
                .build();

        return barcodeRepository.save(barcodeEntity).toDto();
    }

}
