package com.team3.ourassembly.domain.congress.repository;

import com.team3.ourassembly.domain.congress.entity.CommitteeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommitteeRepository extends JpaRepository<CommitteeEntity, Long> {
    Optional<CommitteeEntity> findByName(String name);
    List<CommitteeEntity> findAllByNameIn(List<String> nameList);
}
