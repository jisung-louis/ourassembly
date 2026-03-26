package com.team3.ourassembly.domain.congress.entity;

import com.team3.ourassembly.domain.congress.dto.DistrictResponse;
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
    private String address1; // 시/도

    @Column
    private String address2; // 시/군/구

    @Column
    private String address3; // 읍/면/동

    @ManyToOne
    @JoinColumn(name = "congressman_id")
    private CongressmanEntity congressman;

    public DistrictResponse toDto(){
        return DistrictResponse.builder()
                .id(id)
                .address1(address1)
                .address2(address2)
                .address3(address3)
                .build();
    }
}
