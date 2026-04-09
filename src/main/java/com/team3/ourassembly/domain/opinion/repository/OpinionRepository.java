package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpinionRepository extends JpaRepository<OpinionEntity,Long> {

    // 국회의원 ID로 의견 목록 조회
    List<OpinionEntity> findAllByCongressman_idOrderByCreatedAtDesc(String id);

    List<OpinionEntity> findAllByCongressman_idAndClusterIsNullOrderByCreatedAtDesc(String id);

    List<OpinionEntity> findAllByCongressman_idAndUser_IdOrderByCreatedAtDesc(String congressmanId, Long userId);

    Page<OpinionEntity> findAllByCluster_IdOrderByCreatedAtDesc(Long clusterId, Pageable pageable);

    // 특정 클러스터에 묶인 의견 전체 조회
    List<OpinionEntity> findAllByCluster_idIn(List<Long> clusterIds);


    @Query("""
        SELECT COUNT(o)
        FROM OpinionEntity o
        WHERE o.congressman.id = :id
        AND o.status NOT IN ('답변완료', '답변 완료')
    """)
    long countByCongressmanAndNotClosed(String id);

    @Query("""
        SELECT o.congressman.id
        FROM OpinionEntity o
        WHERE o.status NOT IN ('답변완료', '답변 완료')
        GROUP BY o.congressman.id
        HAVING COUNT(o) >= :count
    """)
    List<String> findCongressmanIdsWithNotClosedCountAtLeast(long count);
}
