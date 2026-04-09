package com.team3.ourassembly.domain.opinion.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
@Table(name = "cluster")
public class ClusterEntity extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congressman_id")
    private CongressmanEntity congressman;

    @Column
    private String title; // 클러스터 대표 주제 , AI에게 클러스터 중앙값 3개의 타이틀을 정리해달라고 해서 여기에 넣음

    @Column(columnDefinition = "LONGTEXT")
    private String content; // 클러스터 대표 내용 , AI에게 클러스터 중앙값 3개의 content를 요약/정리해달라고 해서 여기에 넣음

    @Column
    private String status; // OPEN / CLOSED

    @Column
    private Integer opinionCount;

    @Column(columnDefinition = "VECTOR(1536)")
    @Array(length = 1536)
    @JdbcTypeCode(SqlTypes.VECTOR_FLOAT32)
    private float[] centroidVector;
}
