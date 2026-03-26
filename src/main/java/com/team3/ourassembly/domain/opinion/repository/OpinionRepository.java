package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpinionRepository extends JpaRepository<OpinionEntity,Long> {

    // 국회의원 ID로 의견 목록 조회
    List<OpinionEntity> findAllByCongressmanIdOrderByCreatedAtDesc(Long id);


}
