package com.team3.ourassembly.domain.alarm.entity;

import com.team3.ourassembly.domain.alarm.dto.NotificationResponseDto;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congressman_id",nullable = false)
    private CongressmanEntity congressman;


    private String title; //알림 제목
    private String message; //알림 내용


    public NotificationResponseDto toDto(){
        return NotificationResponseDto.builder()
                .id(id)
                .title(title)
                .message(message)
                .congressmanId(congressman.getId())
                .congressmanName(congressman.getName())
                .build();
    }


}
