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
@Table(name = "district")
public class DistrictEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String address1;

    @Column
    private String address2;

    @Column
    private String address3;

    @ManyToOne
    @JoinColumn(name = "congressman_id")
    private CongressmanEntity congressman;
}
