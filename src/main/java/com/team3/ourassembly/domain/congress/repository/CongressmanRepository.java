package com.team3.ourassembly.domain.congress.repository;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface CongressmanRepository extends JpaRepository<CongressmanEntity, Long> {
    CongressmanEntity findByWard(String ward); // 지역구로 국회의원 찾기 (ex : ward = 서울 종로구)
    List<CongressmanEntity> findByName(String name); // 이름으로 국회의원 찾기
    List<CongressmanEntity> findByParty(String party); // 정당에 속한 국회의원 찾기

    Optional<CongressmanEntity> findByEmail(String email);
    Optional<CongressmanEntity> findByUser_Id(Long userId);
}
