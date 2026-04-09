package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.OpinionVectorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpinionVectorRepository extends JpaRepository<OpinionVectorEntity, Long> {

    @Query("""
        SELECT DISTINCT ov
        FROM OpinionVectorEntity ov
        JOIN FETCH ov.opinion o
        LEFT JOIN FETCH o.cluster c
        WHERE o.congressman.id = :id
        AND o.status NOT IN ('답변완료', '답변 완료')
        AND (
            c IS NULL
            OR NOT EXISTS (
                SELECT 1
                FROM ClusterAnswerEntity ca
                WHERE ca.cluster = c
            )
        )
    """)
    List<OpinionVectorEntity> findClusteringCandidates(String id);
}
