package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.AnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
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
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final CongressmanRepository congressmanRepository;

        // 게시물 등록 기능
        public OpinionResponseDto create(OpinionCreateRequestDto requestDto, Long userId) {
            //1.존재하는 유저인지,존재하는 국회의원인지 유효성검사
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("유저를 찾을수 없습니다."));
             CongressmanEntity congressman = congressmanRepository.findById(requestDto.getCongressmanId())
                     .orElseThrow(()->new IllegalArgumentException("없는 국회의원입니다."));

            // 3. DTO -> Entity 변환
            OpinionEntity saveOpinion = OpinionEntity.builder()
                    .title(requestDto.getTitle()) //
                    .content(requestDto.getContent())
                    .congressman(congressman)
                    .user(user)
                    .build();
            // 4. DB 저장
            OpinionEntity savedOpinion = opinionRepository.save(saveOpinion);

            // 5. 저장된 Entity를 ResponseDto로 변환하여 반환
            return savedOpinion.toDto();

        } // method end



    //의견 수정
    public OpinionResponseDto update(Long opinionId, OpinionUpdateRequestDto dto,Long userId) {
        // 1. 수정할 게시글을 DB에서 꺼내기
        OpinionEntity opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다."));
        // 2. 작성자 본인인지 확인
        if (!opinion.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 게시글만 수정할 수 있습니다.");
        }
        opinion.setTitle(dto.getTitle());
        opinion.setContent(dto.getContent());

        return opinion.toDto();
    }

    public boolean delete(Long opinionId, Long userId) {
        // 1. 삭제할 게시글이 있는지 먼저 확인
        OpinionEntity opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        // 2.작성자 본인인지 확인
        if (!opinion.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 게시글만 수정할 수 있습니다.");
        }

        //삭제
        opinionRepository.delete(opinion);

        return true; // 삭제 성공 시 true 반환
    }




    //특정국회의원 의견게시판 목록 조회
    public List<OpinionResponseDto> getOpinions(Long id) {
        List<OpinionEntity> opinionEntities=opinionRepository.findAllByCongressman_idOrderByCreatedAtDesc(id);

        return opinionEntities.stream()
                .map(opinion -> {
                    OpinionResponseDto dto = opinion.toDto();
                    AnswerResponseDto answer = answerRepository.findByOpinion_id(opinion.getId())
                            .stream()
                            .findFirst()
                            .map(AnswerEntity::toDto)
                            .orElse(null);

                    return OpinionResponseDto.builder()
                            .id(dto.getId())
                            .title(dto.getTitle())
                            .content(dto.getContent())
                            .likeCount(dto.getLikeCount())
                            .viewCount(dto.getViewCount())
                            .status(dto.getStatus())
                            .createdAt(dto.getCreatedAt())
                            .name(dto.getName())
                            .answer(answer)
                            .build();
                })
                .collect(Collectors.toList());
    }




} //class end
