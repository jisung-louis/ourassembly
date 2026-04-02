package com.team3.ourassembly.domain.alarm.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "follow",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "congressman_id"})  // 유저가 중복팔로우 하는것을 방지
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FollowEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; //PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user; //팔로우한 유저

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congressman_id", nullable = false)
    private CongressmanEntity congressman; //팔로우할 국회의원

    @Column(nullable = false, updatable = false)
    private LocalDateTime followedAt; // 팔로우한 시간


}