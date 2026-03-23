package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public void sign(UserDto userDto){
        if(userRepository.existsByEmail(userDto.getEmail())){
            throw new RuntimeException("이미 존재하는 이메일");
        }
        userRepository.save(userDto.toEntity());
    }

    public UserDto login(UserDto userDto){

        UserEntity user = userRepository.findByEmail(userDto.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다."));

        if (!user.getPassword().equals(userDto.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        return user.toDto();
    }
}
