package com.team3.ourassembly.domain.opinion.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
@Table(name = "cluster_answer")
public class ClusterAnswerEntity extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cluster_id")
    private ClusterEntity cluster;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "is_direct")
    private boolean isDirect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congressman_id")
    private CongressmanEntity congressman;

    public AnswerResponseDto toDto() {
        return AnswerResponseDto.builder()
                .id(id)
                .content(content)
                .name(congressman != null ? congressman.getName() : null)
                .isDirect(isDirect)
                .createdAt(getCreatedAt())
                .build();
    }
}
