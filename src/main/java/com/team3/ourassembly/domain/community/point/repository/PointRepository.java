package com.team3.ourassembly.domain.community.point.repository;

import com.team3.ourassembly.domain.community.point.entity.PointEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface PointRepository extends JpaRepository<PointEntity , Long> {

    @Query(value = "SELECT SUM(change_val) FROM point WHERE user_id = :userId", nativeQuery = true)
    Integer sumPointByUserId(Long userId);


    // 포인트 총 발행량
    @Query(value = "select coalesce(sum(change_val), 0) from point where change_val > 0", nativeQuery = true)
    Long sumAllIssuedPoints();

    // 포인트 총 사용량
    @Query(value = "select coalesce(abs(sum(change_val)), 0) from point where change_val < 0", nativeQuery = true)
    Long sumAllUsedPoints();

    // 최근 포인트 내역 5건
    @Query(value = "select u.name, p.change_val, p.reason, p.created_at from point p join user u on p.user_id = u.id order by p.created_at desc limit 5", nativeQuery = true)
    List<Map<String, Object>> findRecentPoints();

    // 날짜 범위 포인트 발행량
    @Query(value = "select coalesce(sum(change_val), 0) from point where change_val > 0 and created_at between :start and :end", nativeQuery = true)
    Integer sumIssuedByDate(LocalDateTime start, LocalDateTime end);

    // 날짜 범위 포인트 사용량
    @Query(value = "select coalesce(abs(sum(change_val)), 0) from point where change_val < 0 and created_at between :start and :end", nativeQuery = true)
    Integer sumUsedByDate( LocalDateTime start,  LocalDateTime end);


}
