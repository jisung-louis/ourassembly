package com.team3.ourassembly.domain.congress.repository;

import com.team3.ourassembly.domain.congress.entity.CongressmanCommitteeEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CongressmanCommitteeRepository extends JpaRepository<CongressmanCommitteeEntity, Long> {
    List<CongressmanCommitteeEntity> findByCongressman(CongressmanEntity congressman);
}
