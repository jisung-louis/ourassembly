package com.team3.ourassembly.domain.bill.repository;

import com.team3.ourassembly.domain.bill.entity.BillEntity;
import com.team3.ourassembly.domain.bill.entity.BillProposerEntity;
import com.team3.ourassembly.domain.bill.entity.BillProposerRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BillProposerRepository extends JpaRepository<BillProposerEntity, Long> {
    void deleteByBill(BillEntity bill);

    @Query("""
            select billProposer
            from BillProposerEntity billProposer
            join fetch billProposer.congressman congressman
            where billProposer.bill = :bill
            order by billProposer.sortOrder asc
            """)
    List<BillProposerEntity> findByBillWithCongressmanOrderBySortOrderAsc(@Param("bill") BillEntity bill);

    @Query("""
            select billProposer
            from BillProposerEntity billProposer
            join fetch billProposer.bill bill
            where billProposer.congressman.id = :congressmanId
            order by bill.proposeDate desc, billProposer.sortOrder asc
            """)
    List<BillProposerEntity> findByCongressmanIdWithBillOrderByBillProposeDateDescSortOrderAsc(
            @Param("congressmanId") String congressmanId
    );

    List<BillProposerEntity> findByBillAndRole(BillEntity bill, BillProposerRole role);
}
