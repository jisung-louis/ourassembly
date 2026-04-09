package com.team3.ourassembly.domain.community.point.dto;

import com.team3.ourassembly.domain.community.point.entity.PointEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.awt.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointDto {
    private Long pointId;
    private Integer changeVal;
    private Integer reason;
    private Long userId;
    private String createDate;
    private String updateDate;

    public PointEntity toEntity(){
        return PointEntity.builder()
                .changeVal(changeVal)
                .reason(reason)
                .build();
    }
}
