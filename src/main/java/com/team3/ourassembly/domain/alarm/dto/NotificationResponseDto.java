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
    private String title;
    private String message;
    private String congressmanId;
    private String congressmanName;
    private LocalDateTime createdAt;
    private boolean isRead;




}
