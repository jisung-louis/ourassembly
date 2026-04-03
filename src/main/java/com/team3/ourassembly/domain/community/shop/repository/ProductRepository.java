package com.team3.ourassembly.domain.community.shop.repository;

import com.team3.ourassembly.domain.community.shop.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity , Long> {



    Page<ProductEntity> findAllByOrderByPriceDesc(PageRequest pageRequest);
    Page<ProductEntity> findAllByOrderByPriceAsc(PageRequest pageRequest);
}
