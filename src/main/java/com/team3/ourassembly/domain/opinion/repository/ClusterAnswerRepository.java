package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.ClusterAnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.ClusterEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClusterAnswerRepository extends JpaRepository<ClusterAnswerEntity, Long> {
    boolean existsByCluster(ClusterEntity cluster);

    Optional<ClusterAnswerEntity> findByCluster_id(Long clusterId);

    List<ClusterAnswerEntity> findAllByCluster_IdIn(List<Long> clusterIds);

    @Query("""
        SELECT ca
        FROM ClusterAnswerEntity ca
        JOIN FETCH ca.cluster c
        WHERE c.congressman.id = :congressmanId
        AND c.status = 'CLOSED'
        AND ca.createdAt >= :cutoff
    """)
    List<ClusterAnswerEntity> findRecentClosedAnswers(
            @Param("congressmanId") String congressmanId,
            @Param("cutoff") LocalDateTime cutoff
    );
}
