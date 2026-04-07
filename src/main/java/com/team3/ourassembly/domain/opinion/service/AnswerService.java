package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.AnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final OpinionRepository opinionRepository;
    private final CongressmanRepository congressmanRepository;
    private final UserRepository userRepository;

        //***답변 등록***//
        public AnswerResponseDto createAnswer(AnswerCreateRequestDto createRequestDto, Long userId) {
            OpinionEntity opinion = opinionRepository.findById(createRequestDto.getOpinionId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 질문글이 존재하지 않습니다."));

            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자 계정 정보를 찾을 수 없습니다."));

            CongressmanEntity congressman = congressmanRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("국회의원 정보를 찾을 수 없습니다."));


            AnswerEntity answerSave = AnswerEntity.builder()
                    .content(createRequestDto.getContent())
                    .isDirect(createRequestDto.isDirect())
                    .opinion(opinion)      // 질문과 연결
                    .congressman(congressman)
                    .build();
            //5.저장 및 dto로 반환
            AnswerEntity saved=answerRepository.save(answerSave);

            // 6. 질문 상태 변경 (답변 대기 -> 답변 완료)
            opinion.setStatus("답변완료");

            //7.dto 반환하기
            return saved.toDto();

        } //method end



        //***답변 수정***//
        @Transactional
        public AnswerResponseDto updateAnswer(Long id, AnswerUpdateRequestDto dto, Long userId) {

            // 1. 답변 조회
            AnswerEntity answer = answerRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));

            // 2. 작성자 검증 조회
            if (answer.getCongressman() == null || !answer.getCongressman().getId().equals(userId)) {
                throw new IllegalArgumentException("본인 답변만 수정할 수 있습니다.");
            }

            // 3. 수정
            answer.setContent(dto.getContent());
            answer.setDirect(dto.isDirect());

            // 4. 반환
            return answer.toDto();
        }


    //****답변 삭제****//
    public void deleteAnswer(Long answerId, Long userId) {

        // 1. 답변 조회
        AnswerEntity answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 답변이 존재하지 않습니다."));

        // 2. 작성자 검증
        if (answer.getCongressman() == null ||
                !answer.getCongressman().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 답변만 삭제할 수 있습니다.");
        }

        // 3. 질문 상태 바꾸기
        if (answer.getOpinion() != null) {
            answer.getOpinion().setStatus("답변대기");
        }

        // 4. 삭제
        answerRepository.delete(answer);
    }




} //class end
