package com.team3.ourassembly.domain.congress.repository;

import com.team3.ourassembly.domain.congress.entity.DistrictEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<DistrictEntity, Long> {
    List<DistrictEntity> findByAddress1(String address1);
    List<DistrictEntity> findByAddress1AndCongressmanIsNull(String address1);

    @Query("""
            select d
            from DistrictEntity d
            where d.congressman is not null
              and lower(concat(d.address1, ' ', d.address2, ' ', d.address3)) like lower(concat('%', :query, '%'))
            order by d.address1 asc, d.address2 asc, d.address3 asc
            """)
    List<DistrictEntity> searchByAddressQuery(String query, Pageable pageable);
}
