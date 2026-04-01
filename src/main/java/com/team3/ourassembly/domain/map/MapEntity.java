package com.team3.ourassembly.domain.map;


import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class MapEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long markId;
    // PK (지도 마커 1개)

    private String title;
    // 활동 제목 (예: ○○시장 방문)

    private String description;
    // 상세 설명

    private Double latitude;
    // 위도 (지도 위치)

    private Double longitude;
    // 경도

    private String imageUrl;
    // 대표 이미지

    private LocalDateTime activityTime;
    // 실제 활동 시간

    private LocalDateTime createdAt;
    // 등록 시간

    @ManyToOne
    @JoinColumn(name = "congress_id")
    private CongressmanEntity congressman;
    // 어떤 국회의원 활동인지
} //class end
