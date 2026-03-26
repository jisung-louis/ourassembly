package com.team3.ourassembly.domain.user.dto;

import com.team3.ourassembly.domain.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data@NoArgsConstructor@AllArgsConstructor@Builder
public class    UserDto {
    private Long id;
    private String email;
    private String password;
    private String name;
    private String address;
    private String createAt;
    private String updateAt;

    public UserEntity toEntity(){
        return UserEntity.builder()
                .id(id)
                .email(email)
                .password(password)
                .name(name)
                .address(address)
                .build();
    }
}
