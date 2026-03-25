package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OpinionService {
    private final OpinionRepository opinionRepository;


    // 게시물 등록 기능
    public OpinionResponseDto create(OpinionCreateRequestDto dto) {
        // 1 & 2. 유저 및 의원 조회 (나중에 통합 시 구현)
        // UserEntity user = userRepository.findById(dto.getUserId()).orElseThrow(...);
        // Congressman congressman = congressmanRepository.findById(dto.getCongressmanId()).orElseThrow(...);

        // 3. DTO -> Entity 변환
        OpinionEntity opinion = dto.ToEntity();

        // 4. 연관관계 매핑 (회원/의원 정보 세팅 로직 등...)

        // 5. DB 저장
        OpinionEntity savedOpinion = opinionRepository.save(opinion);

        // 6. 저장된 Entity를 ResponseDto로 변환하여 반환
        return savedOpinion.toDto();

    } // method end





    //특정국회의원 의견게시판 목록 조회
    public List<OpinionResponseDto> getOpinions(Integer congress_id) {
        List<OpinionEntity> opinionEntities=opinionRepository.findByCongressman_id(congress_id);

        return opinionEntities.stream()
                .map(OpinionEntity::toDto)
                .collect(Collectors.toList());
    }

    //의견 수정
    public OpinionResponseDto update(Long opinion_id, OpinionUpdateRequestDto dto) {
        // 1. 수정할 게시글을 DB에서 꺼내기
        OpinionEntity opinion = opinionRepository.findById(opinion_id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다."));

        opinion.setTitle(dto.getTitle());
        opinion.setContent(dto.getContent());

        return opinion.toDto();
    }

    //의견 삭제
    public boolean deleteOpinion(Long id) {
        // 1. 해당 ID의 게시글이 있는지 확인
        if (opinionRepository.existsById(id)) {
            // 2. 있으면 삭제
            opinionRepository.deleteById(id);
            return true;
        }
        // 3. 없으면 삭제 실패(false) 반환
        return false;
    }



//    //특정국회의원 의견 목록 전체 조회(국회의원 id를 매개변수로 받아서)
//    public List<OpinionResponseDto> getOpinionList(Long congressman_id) {
//        return opinionRepository
//                .findByCongressman_id(congressman_id)
//                .stream()
//                .map(OpinionEntity::toDto)
//                .collect(Collectors.toList());
//    }


} //class end
