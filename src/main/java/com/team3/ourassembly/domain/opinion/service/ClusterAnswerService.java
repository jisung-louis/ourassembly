package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.ClusterAnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.ClusterEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.repository.ClusterAnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.ClusterRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ClusterAnswerService {
    private final ClusterAnswerRepository clusterAnswerRepository;
    private final ClusterRepository clusterRepository;
    private final OpinionRepository opinionRepository;
    private final CongressmanRepository congressmanRepository;
    private final UserRepository userRepository;

    public AnswerResponseDto createAnswer(Long clusterId, AnswerCreateRequestDto createRequestDto, Long userId) {
        ClusterEntity cluster = clusterRepository.findById(clusterId)
                .orElseThrow(() -> new IllegalArgumentException("해당 클러스터가 존재하지 않습니다."));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자 계정 정보를 찾을 수 없습니다."));

        CongressmanEntity congressman = congressmanRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("국회의원 정보를 찾을 수 없습니다."));

        validateClusterOwner(cluster, congressman);

        if (clusterAnswerRepository.findByCluster_id(clusterId).isPresent()) {
            throw new IllegalArgumentException("이미 답변이 등록된 클러스터입니다.");
        }

        ClusterAnswerEntity saved = clusterAnswerRepository.save(
                ClusterAnswerEntity.builder()
                        .cluster(cluster)
                        .content(createRequestDto.getContent())
                        .isDirect(createRequestDto.isDirect())
                        .congressman(congressman)
                        .build()
        );

        // 클러스터에 답변이 달리면 닫힌 상태로 전환
        cluster.setStatus("CLOSED");
        updateOpinionStatuses(cluster.getId(), "답변완료");

        return saved.toDto();
    }

    public AnswerResponseDto updateAnswer(Long answerId, AnswerUpdateRequestDto dto, Long userId) {
        ClusterAnswerEntity answer = clusterAnswerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));

        validateAnswerOwner(answer, userId);

        answer.setContent(dto.getContent());
        answer.setDirect(dto.isDirect());

        return answer.toDto();
    }

    public void deleteAnswer(Long answerId, Long userId) {
        ClusterAnswerEntity answer = clusterAnswerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 답변이 존재하지 않습니다."));

        validateAnswerOwner(answer, userId);

        ClusterEntity cluster = answer.getCluster();
        if (cluster != null) {
            cluster.setStatus("OPEN");
            updateOpinionStatuses(cluster.getId(), "답변대기");
        }

        clusterAnswerRepository.delete(answer);
    }

    private void validateClusterOwner(ClusterEntity cluster, CongressmanEntity congressman) {
        if (cluster.getCongressman() == null || !cluster.getCongressman().getId().equals(congressman.getId())) {
            throw new IllegalArgumentException("본인 클러스터에만 답변할 수 있습니다.");
        }
    }

    private void validateAnswerOwner(ClusterAnswerEntity answer, Long userId) {
        if (answer.getCongressman() == null
                || answer.getCongressman().getUser() == null
                || !answer.getCongressman().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 답변만 수정할 수 있습니다.");
        }
    }

    private void updateOpinionStatuses(Long clusterId, String status) {
        List<OpinionEntity> opinions = opinionRepository.findAllByCluster_idIn(List.of(clusterId));

        // 클러스터 답변 상태를 각 의견에도 반영
        for (OpinionEntity opinion : opinions) {
            opinion.setStatus(status);
        }
    }
}
