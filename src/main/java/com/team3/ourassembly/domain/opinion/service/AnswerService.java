package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.AnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AnswerService {
    private AnswerRepository answerRepository;
    private OpinionRepository opinionRepository;


        //***답변 등록***//
        public AnswerResponseDto createAnswer(AnswerCreateRequestDto createRequestDto) {
            //1.답변을 할 글이 존재하는지 조회
            OpinionEntity opinion = opinionRepository.findById(createRequestDto.getOpinionId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 질문글이 존재하지 않습니다."));
            //2.해당 게시판의 국회의원만 글을 달수있게

            //3.국회의원 엔티티 조회
    //        Congressman congressman = congressmanRepository.findById(loginCongressId)
    //                .orElseThrow(() -> new IllegalArgumentException("의원 정보를 찾을 수 없습니다."));

            // 4.답변 엔티티 매핑하기(DTO에서는 내용만 가져오고, FK(질문, 의원)는 서비스에서 조회)
            AnswerEntity answer = AnswerEntity.builder()
                    .content(createRequestDto.getContent())
                    .opinion(opinion)      // 질문과 연결
    //                .congressman(congressman) // 작성자(의원)와 연결
                    .build();
            //5.저장 및 dto로 반환
            AnswerEntity saved=answerRepository.save(answer);
            // 6. 질문 상태 변경 (답변 대기 -> 답변 완료)
            opinion.setStatus("답변완료");

            //7.dto 반환하기
            return saved.toDto();

        } //method end



        //***답변 수정***//
    public AnswerResponseDto updateAnswer(AnswerUpdateRequestDto updateRequestDto){
            //1.수정할 답변이 존재하는지 확인
        AnswerEntity answer=answerRepository.findById(updateRequestDto.getId())
                .orElseThrow(()->new IllegalArgumentException("답변이 존재하지 않습니다."));

        //2.답변을 쓴 국회의원 id와 지금 로그인한 id가 같은지 여부

        //3.
        answer.setContent(updateRequestDto.getContent());
        answer.setDirect(updateRequestDto.isDirect());

        return answer.toDto();
    }


    //****답변 삭제****//
    public void deleteAnswer(Long answerId) {
        // 1. 삭제할 답변이 있는지 조회 (Optional 활용)
        AnswerEntity answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 답변이 존재하지 않습니다."));

        // 2. 권한 검증: 이 답변을 쓴 국회의원 본인이 맞는지 확인

        // 3. 질문 상태 복구
        answer.getOpinion().setStatus("답변대기");

        // 4. DB에서 삭제
        answerRepository.delete(answer);
    }




} //class end
