package com.team3.ourassembly.domain.alarm.dto;

import com.team3.ourassembly.domain.alarm.entity.FollowEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FollowResponseDto {
    private String congressmanId; //팔로우한 의원번호
    private String congressmanName;  // 팔로우한 의원 이름
    private String party;            // 정당
    private LocalDateTime followedAt; // 팔로우한 시간




    //entity->dto로 바꾸는 로직
    public static FollowResponseDto from(FollowEntity follow) {
        return FollowResponseDto.builder()
                .congressmanId(follow.getCongressman().getId())
                .congressmanName(follow.getCongressman().getName())
                .party(follow.getCongressman().getParty())
                .followedAt(follow.getFollowedAt())
                .build();
    }
} //func end
