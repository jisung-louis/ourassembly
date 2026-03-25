package com.team3.ourassembly.domain.opinion.repository;

import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<AnswerEntity,Long> {
    // 특정 질문글 번호(opinionId)로 답변을 찾는 메소드
    List<AnswerEntity> findByOpinionEntity_id(Long opinion_id);
}
