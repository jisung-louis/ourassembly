package com.team3.ourassembly.domain.user.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.user.dto.UserDto;
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
@Table(name = "user")
public class UserEntity extends BaseTime {
    @Id @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column
    private String address;

    @Column(columnDefinition = "int default 0")
    private Integer point;



    public UserDto toDto(){
        return UserDto.builder()
                .id(id)
                .name(name)
                .email(email)
                .point(point)
                .createAt(getCreatedAt().toString())
                .updateAt(getUpdatedAt().toString())
                .build();
    }
}
