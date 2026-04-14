package com.team3.ourassembly.domain.community.shop.repository;

import com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BarcodeRepository extends JpaRepository<BarcodeEntity , Long> {

    // 바코드 userId로 재고 조회
    @Query(value = "SELECT COUNT(*) FROM barcode WHERE product_id = :productId AND user_id IS NULL", nativeQuery = true)
    int countAvailableBarcode(Long productId);


    // 바코드 userId로 남은 재고들 반환
    @Query(value = "SELECT * FROM barcode WHERE product_id = :productId AND user_id IS NULL LIMIT 1 ", nativeQuery = true)
    Optional<BarcodeEntity> findAvailableBarcode(Long productId);

    //
    @Query(value = "select * from barcode where user_id = :userId" , nativeQuery = true)
    List<BarcodeEntity> myGift(Long userId);

    @Modifying
    @Query(value = "DELETE FROM barcode WHERE product_id = :productId", nativeQuery = true)
    void deleteAllByProductId(Long productId);



}
