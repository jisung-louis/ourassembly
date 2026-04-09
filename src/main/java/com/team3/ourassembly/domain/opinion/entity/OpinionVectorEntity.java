package com.team3.ourassembly.domain.opinion.entity;

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
@Table(name = "opinion_vector")
public class OpinionVectorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opinion_id")
    private OpinionEntity opinion;

    @Column(columnDefinition = "VECTOR(1536)")
    @Array(length = 1536)
    @JdbcTypeCode(SqlTypes.VECTOR_FLOAT32)
    private float[] vectorData;
}
