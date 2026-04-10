package com.team3.ourassembly.domain.alarm.repository;

import com.team3.ourassembly.domain.alarm.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // 안읽은 알림 개수
    long countByUserIdAndIsReadFalse(Long userId);

    // 내 알림 목록
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteAllByUserId(Long userId);

}