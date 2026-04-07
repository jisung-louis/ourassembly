package com.team3.ourassembly.domain.bill.repository;

import com.team3.ourassembly.domain.bill.entity.BillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<BillEntity, String> {
}
