package com.team3.ourassembly.domain.congress.entity;

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
@Table(name = "congressman_committee")
public class CongressmanCommitteeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "committee_id")
    private CommitteeEntity committee;

    @ManyToOne
    @JoinColumn(name = "congressman_id")
    private CongressmanEntity congressman;
}
