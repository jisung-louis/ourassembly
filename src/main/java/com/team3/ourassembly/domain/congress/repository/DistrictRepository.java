package com.team3.ourassembly.domain.congress.repository;

import com.team3.ourassembly.domain.congress.entity.DistrictEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<DistrictEntity, Long> {
    List<DistrictEntity> findByAddress1(String address1);
    List<DistrictEntity> findByAddress1AndCongressmanIsNull(String address1);
}
