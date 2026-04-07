package com.team3.ourassembly.domain.community.point.entity;

import com.team3.ourassembly.domain.community.point.dto.PointDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "point")
public class PointEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pointId;

    @Column(name = "change_val" , nullable = false)
    private Integer changeVal;

    @Column(name = "reason" , nullable = false)
    private Integer reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id" , nullable = false)
    private UserEntity user;

    public PointDto toDto(){
        return PointDto.builder()
                .changeVal(changeVal)
                .reason(reason)
                .createDate(getCreatedAt().toString())
                .updateDate(getUpdatedAt().toString())
                .build();
    }



}
