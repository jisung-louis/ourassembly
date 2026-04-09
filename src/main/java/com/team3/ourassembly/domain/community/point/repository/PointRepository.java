package com.team3.ourassembly.domain.community.point.repository;

import com.team3.ourassembly.domain.community.point.entity.PointEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PointRepository extends JpaRepository<PointEntity , Long> {

    @Query(value = "SELECT SUM(change_val) FROM point WHERE user_id = :userId", nativeQuery = true)
    Integer sumPointByUserId(Long userId);
}
