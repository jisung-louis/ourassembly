package com.team3.ourassembly.domain.congress.entity;

import com.team3.ourassembly.domain.congress.dto.CongressmanDetailResponse;
import com.team3.ourassembly.domain.congress.dto.CongressmanSummaryResponse;
import com.team3.ourassembly.domain.user.entity.UserEntity;
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
@Table(name = "congressman")
public class CongressmanEntity extends BaseTime {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String party;

    @Column
    private String photoUrl;

    @Column
    private String email;

    @Column(columnDefinition = "longtext")
    private String career;

    @Column
    private String numberOfReElection;

    @Column
    private String tel;

    @Column
    private String address;

    @Column
    private String ward;

    @OneToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    public CongressmanDetailResponse toDto(){
        return CongressmanDetailResponse.builder()
                .id(id)
                .name(name)
                .party(party)
                .photoUrl(photoUrl)
                .email(email)
                .career(career)
                .numberOfReElection(numberOfReElection)
                .tel(tel)
                .address(address)
                .ward(ward)
                .userId(user.getId())
                .build();
    }

    public CongressmanSummaryResponse toSummaryDto(){
        return CongressmanSummaryResponse.builder()
                .congressmanId(id)
                .congressmanName(name)
                .congressmanPhotoUrl(photoUrl)
                .congressmanParty(party)
                .congressmanWard(ward)
                .build();
    }
}
