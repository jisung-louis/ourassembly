package com.team3.ourassembly.domain.alarm.service;

import com.team3.ourassembly.domain.alarm.dto.FollowResponseDto;
import com.team3.ourassembly.domain.alarm.entity.FollowEntity;
import com.team3.ourassembly.domain.alarm.repository.FollowRepository;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final CongressmanRepository congressmanRepository;


    /*
    국회의원 팔로우하기
     */
    public void follow(Long userId, String congressmanId) {

        //1.실제로 존재하는 유저인지 확인
        UserEntity user = userRepository.findById(userId).orElse(null);
        //2.실제로 존재하는 국회의원인지 확인
        CongressmanEntity congressman = congressmanRepository.findById(congressmanId).orElse(null);

        //이미 팔로우중인지 확인 팔로우중인 아니면? 팔로우하기!
        if(followRepository.findByUserAndCongressman(user,congressman).isEmpty()){
            followRepository.save(FollowEntity.builder()
                    .user(user)
                    .congressman(congressman)
                    .followedAt(LocalDateTime.now())
                    .build());
        }
    }


    // 언팔로우
    @Transactional
    public void unfollow(Long userId, String congressmanId) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        CongressmanEntity congressman = congressmanRepository.findById(congressmanId).orElse(null);

        if (user == null || congressman == null) return;

        followRepository.deleteByUserAndCongressman(user, congressman);
    }

    // 팔로우한 목록조회
    public List<FollowResponseDto> getMyFollowingList(Long userId) {
        UserEntity user = userRepository.findById(userId).orElse(null);


        return followRepository.findByUser(user)
                .stream()
                .map(FollowResponseDto::from)
                .collect(Collectors.toList());
    }

}
