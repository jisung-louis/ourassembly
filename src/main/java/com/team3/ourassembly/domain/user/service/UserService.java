package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.congress.service.CongressmanService;
import com.team3.ourassembly.domain.user.Storage;
import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public  final Storage storage;
    private final CongressmanRepository congressmanRepository;
    private final CongressmanService congressmanService;


    public void sign(UserDto userDto){

        if(userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        String status = storage.get(userDto.getEmail());
        if(status==null||!status.equals("verified")){
            throw new RuntimeException("이메일 인증이 완료되지 않았습니다");
        }
        UserEntity saveEntity = userDto.toEntity();
        String pwd = passwordEncoder.encode(saveEntity.getPassword());
        saveEntity.setPassword(pwd);
        userRepository.save(saveEntity);

        boolean result = congressmanService.setUserToCongressman(saveEntity);




        storage.remove(userDto.getEmail());
    }


    public UserDto login(UserDto loginDto){

        UserEntity userEntity = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        if(!passwordEncoder.matches(loginDto.getPassword(), userEntity.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        Optional<CongressmanEntity> optional = congressmanRepository.findByUser_Id(userEntity.getId());
        if(optional.isPresent()){
            UserDto dto = userEntity.toDto();
            dto.setRole("congress");
            return dto;
        }
        else
        {return userEntity.toDto();}

    }
}
