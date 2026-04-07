package com.team3.ourassembly.domain.alarm.dto;


import com.team3.ourassembly.domain.alarm.entity.NotificationEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String title; //알림 제목
    private String message;          // 알림 내용
    private Long congressmanId;      // 관련 의원 ID
    private String congressmanName;  // 관련 의원 이름
    private LocalDateTime createdAt;




}
