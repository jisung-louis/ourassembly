package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.ClusterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClusterRepository extends JpaRepository<ClusterEntity, Long> {
    List<ClusterEntity> findAllByCongressman_IdOrderByCreatedAtDesc(String congressmanId);
}
