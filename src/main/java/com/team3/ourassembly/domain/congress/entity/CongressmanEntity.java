package com.team3.ourassembly.domain.congress.entity;

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
    private int id;

    @Column(nullable = false)
    private String name;

    @Column
    private String party;

    @Column
    private String photoUrl;

    @Column
    private String email;

    @Column
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
}
