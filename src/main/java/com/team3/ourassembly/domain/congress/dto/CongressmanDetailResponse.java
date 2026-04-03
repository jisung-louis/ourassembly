package com.team3.ourassembly.domain.congress.dto;

import com.team3.ourassembly.domain.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CongressmanDetailResponse {
    private Long id;
    private String name;
    private String party;
    private String photoUrl;
    private String email;
    private String career;
    private String numberOfReElection;
    private String tel;
    private String address;
    private String ward;
    private Long userId;
    private List<String> committee;
    private String age;
}
