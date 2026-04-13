package com.team3.ourassembly.domain.alarm.repository;

import com.team3.ourassembly.domain.alarm.entity.FollowEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<FollowEntity,Long> {

    Optional<FollowEntity> findByUserAndCongressman(UserEntity user, CongressmanEntity congressman);


    //회원이 팔로우한 국회의원 목록
    List<FollowEntity> findByUser(UserEntity user);

    //팔로우 수
    Integer countByCongressman(CongressmanEntity congressman);

    void deleteByUserAndCongressman(UserEntity user, CongressmanEntity congressman);



    //특정의원을 팔로우한 유저목록
    List<FollowEntity> findByCongressman(CongressmanEntity congressman);


}
