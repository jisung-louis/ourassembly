package com.team3.ourassembly.domain.user.repository;

import com.team3.ourassembly.domain.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity , Long> {

    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);


    @Query(value = "select id, name, email, created_at from user order by created_at desc limit 5", nativeQuery = true)
    List<Map<String, Object>> findRecentUsers();


    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);


    @Modifying
    @Query("UPDATE UserEntity u SET u.fcmToken = null WHERE u.fcmToken IN :tokens")
    void clearFcmTokensByTokens(@Param("tokens") List<String> tokens);

}
