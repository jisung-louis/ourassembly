package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.opinion.dto.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class OpinionService {
    private final OpinionRepository opinionRepository;


    //게시물 등록(db에 저장하는 동시에 바로 클라이언트에게 데이터도 반환하게끔 구현)
    public OpinionResponseDto create(OpinionCreateRequestDto dto) {
        //1유저조회(실제로 존재하는 유저인지) 통합하면 넣기
        //2.의원조회(실제로 존재하는 의원인지) 통합하면 넣기
        //3.dto->entity로 변환
        OpinionEntity opinion=dto.ToEntity();
        //4.회원/의원 정보 넣기 통합하면 넣을예정
        opinionRepository.save(opinion);
        //5.저장된 Entity를 클라이언트한테 보여줄 형태 (DTO)로 변환

        return OpinionResponseDto.from(opinion);
    } //func end

} //class end
