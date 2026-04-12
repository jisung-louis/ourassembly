package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
import com.team3.ourassembly.domain.opinion.dto.board.BoardItemResponseDto;
import com.team3.ourassembly.domain.opinion.dto.board.BoardResponseDto;
import com.team3.ourassembly.domain.opinion.dto.board.ClusterOpinionPageResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionSimilarityCheckRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionSimilarityCheckResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionUpdateRequestDto;
import com.team3.ourassembly.domain.opinion.entity.AnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.ClusterAnswerEntity;
import com.team3.ourassembly.domain.opinion.entity.ClusterEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionVectorEntity;
import com.team3.ourassembly.domain.opinion.repository.AnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.ClusterAnswerRepository;
import com.team3.ourassembly.domain.opinion.repository.ClusterRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionVectorRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.team3.ourassembly.domain.opinion.event.ClusterTriggerEvent;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OpinionService {
    private static final int MIN_CLUSTERING_SIZE = 300;
    private static final float CLOSED_CLUSTER_SIMILARITY_THRESHOLD = 0.85f; // 85% 이상 유사시
    private static final long CLOSED_CLUSTER_LOOKBACK_DAYS = 30L;

    private final OpinionRepository opinionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final CongressmanRepository congressmanRepository;
    private final OpinionVectorRepository opinionVectorRepository;
    private final ClusterAnswerRepository clusterAnswerRepository;
    private final ClusterRepository clusterRepository;
    private final ApplicationEventPublisher eventPublisher;

    private final EmbeddingModel embeddingModel;

        // 게시물 등록 기능
        public OpinionResponseDto create(OpinionCreateRequestDto requestDto, Long userId) {
            //1.존재하는 유저인지,존재하는 국회의원인지 유효성검사
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("유저를 찾을수 없습니다."));
            CongressmanEntity congressman = congressmanRepository.findById(requestDto.getCongressmanId())
                    .orElseThrow(()->new IllegalArgumentException("없는 국회의원입니다."));

            // 2. TODO : 현재 존재하는 클러스터와 특정 정도 이상 유사할 때 그 클러스터에 넣기

            // 3. DTO -> Entity 변환
            OpinionEntity saveOpinion = OpinionEntity.builder()
                    .title(requestDto.getTitle()) //
                    .content(requestDto.getContent())
                    .status("답변대기")
                    .congressman(congressman)
                    .user(user)
                    .build();
            // 4. DB 저장
            OpinionEntity savedOpinion = opinionRepository.save(saveOpinion);

            // 5. 의견 임베딩(벡터화)
            float[] responseVector = embeddingModel
                    .embedForResponse(List.of(requestDto.getContent()))
                    .getResult()
                    .getOutput();

            // 6. OpinionVector 테이블에 저장
            OpinionVectorEntity saveOpinionVector = OpinionVectorEntity.builder()
                    .vectorData(responseVector)
                    .opinion(savedOpinion)
                    .build();
            OpinionVectorEntity savedOpinionVector = opinionVectorRepository.save(saveOpinionVector);


            // 7. 첫 클러스터링 실시 ((개별답변 달리지 않은) 의견이 300개가 되었고, 한 번도 클러스터링된 적 없을 때)
            boolean alreadyClustered = congressmanRepository
                    .findById(congressman.getId())
                    .map(CongressmanEntity::getClusteringStarted)
                    .orElse(false);
            long count = opinionRepository.countByCongressmanAndNotClosed(savedOpinion.getCongressman().getId());

            if (count >= MIN_CLUSTERING_SIZE && !alreadyClustered) {
                // 첫 클러스터링은 커밋 이후 비동기로 실행
                eventPublisher.publishEvent(new ClusterTriggerEvent(congressman.getId()));
            }

            OpinionResponseDto response = savedOpinion.toDto();
            response.setVectorData(savedOpinionVector.getVectorData());

            // 7. 반환
            return response;

        } // method end

    public OpinionSimilarityCheckResponseDto checkSimilarClosedCluster(OpinionSimilarityCheckRequestDto requestDto) {
        float[] opinionVector = embeddingModel
                .embedForResponse(List.of(requestDto.getContent()))
                .getResult()
                .getOutput();

        List<ClusterAnswerEntity> recentClosedAnswers = clusterAnswerRepository.findRecentClosedAnswers(
                requestDto.getCongressmanId(),
                LocalDateTime.now().minusDays(CLOSED_CLUSTER_LOOKBACK_DAYS)
        );

        ClusterAnswerEntity bestMatch = null;
        float bestSimilarity = 0.0f;

        for (ClusterAnswerEntity clusterAnswer : recentClosedAnswers) {
            ClusterEntity cluster = clusterAnswer.getCluster();
            if (cluster == null || cluster.getCentroidVector() == null) {
                continue;
            }

            float similarity = cosineSimilarity(opinionVector, cluster.getCentroidVector());
            System.out.println("유사도 = " + similarity + " %");
            if (similarity >= CLOSED_CLUSTER_SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = clusterAnswer;
            }
        }

        if (bestMatch == null || bestMatch.getCluster() == null) {
            return OpinionSimilarityCheckResponseDto.builder()
                    .matched(false)
                    .build();
        }

        long daysAgo = ChronoUnit.DAYS.between(
                bestMatch.getCreatedAt().toLocalDate(),
                LocalDate.now()
        );

        return OpinionSimilarityCheckResponseDto.builder()
                .matched(true)
                .similarityPercent(Math.round(bestSimilarity * 100))
                .daysAgo(daysAgo)
                .clusterId(bestMatch.getCluster().getId())
                .clusterTitle(bestMatch.getCluster().getTitle())
                .clusterContent(bestMatch.getCluster().getContent())
                .answer(bestMatch.toDto())
                .build();
    }

    // for test
    public float[] getVector(){
            return opinionVectorRepository.findById(1L).orElseThrow().getVectorData();
    }



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
    public BoardResponseDto getBoard(String id, Long userId) {
        boolean updating = congressmanRepository.findById(id)
                .map(congressman -> Boolean.TRUE.equals(congressman.getClusteringInProgress()))
                .orElse(false);

        List<ClusterEntity> clusters = clusterRepository.findAllByCongressman_IdOrderByCreatedAtDesc(id);
        List<OpinionEntity> generalOpinions = opinionRepository.findAllByCongressman_idAndClusterIsNullOrderByCreatedAtDesc(id);
        List<OpinionEntity> myOpinions = userId != null
                ? opinionRepository.findAllByCongressman_idAndUser_IdOrderByCreatedAtDesc(id, userId)
                : List.of();

        Map<Long, AnswerResponseDto> clusterAnswerMap = buildClusterAnswerMap(clusters);
        Map<Long, AnswerResponseDto> generalDirectAnswerMap = buildOpinionAnswerMap(generalOpinions);
        Map<Long, AnswerResponseDto> myDirectAnswerMap = buildOpinionAnswerMap(myOpinions);

        List<BoardItemResponseDto> clusterItems = buildClusterItems(clusters, clusterAnswerMap);
        List<BoardItemResponseDto> opinionItems = buildOpinionItems(generalOpinions, generalDirectAnswerMap, clusterAnswerMap);
        List<BoardItemResponseDto> myOpinionItems = buildOpinionItems(myOpinions, myDirectAnswerMap, clusterAnswerMap);

        return BoardResponseDto.builder()
                .boardMode(clusterItems.isEmpty() ? "LIST" : "CLUSTER")
                .updating(updating)
                .clusterCount(clusterItems.size())
                .opinionCount(opinionItems.size())
                .myOpinionCount(myOpinionItems.size())
                .clusterItems(clusterItems)
                .opinionItems(opinionItems)
                .myOpinionItems(myOpinionItems)
                .build();
    }

    public ClusterOpinionPageResponseDto getClusterOpinions(Long clusterId, int page, int size) {
        Page<OpinionEntity> opinionsPage = opinionRepository.findAllByCluster_IdOrderByCreatedAtDesc(
                clusterId,
                PageRequest.of(Math.max(page, 0), Math.max(size, 1))
        );

        List<OpinionEntity> opinions = opinionsPage.getContent();
        Map<Long, AnswerResponseDto> directAnswerMap = buildOpinionAnswerMap(opinions);
        Map<Long, AnswerResponseDto> clusterAnswerMap = buildClusterAnswerMap(
                opinions.stream()
                        .map(OpinionEntity::getCluster)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList()
        );

        return ClusterOpinionPageResponseDto.builder()
                .page(opinionsPage.getNumber())
                .size(opinionsPage.getSize())
                .totalCount(opinionsPage.getTotalElements())
                .hasNext(opinionsPage.hasNext())
                .items(buildOpinionItems(opinions, directAnswerMap, clusterAnswerMap))
                .build();
    }

    private Map<Long, AnswerResponseDto> buildOpinionAnswerMap(List<OpinionEntity> opinions) {
        List<Long> opinionIds = opinions.stream()
                .map(OpinionEntity::getId)
                .toList();

        if (opinionIds.isEmpty()) {
            return Map.of();
        }

        return answerRepository.findAllByOpinion_idIn(opinionIds).stream()
                .collect(Collectors.toMap(
                        answer -> answer.getOpinion().getId(),
                        AnswerEntity::toDto,
                        (left, right) -> left
                ));
    }

    private Map<Long, AnswerResponseDto> buildClusterAnswerMap(List<ClusterEntity> clusters) {
        List<Long> clusterIds = clusters.stream()
                .map(ClusterEntity::getId)
                .toList();

        if (clusterIds.isEmpty()) {
            return Map.of();
        }

        return clusterAnswerRepository.findAllByCluster_IdIn(clusterIds).stream()
                .collect(Collectors.toMap(
                        answer -> answer.getCluster().getId(),
                        ClusterAnswerEntity::toDto,
                        (left, right) -> left
                ));
    }

    private List<BoardItemResponseDto> buildOpinionItems(
            List<OpinionEntity> opinions,
            Map<Long, AnswerResponseDto> directAnswerMap,
            Map<Long, AnswerResponseDto> clusterAnswerMap
    ) {
        return opinions.stream()
                .map(opinion -> BoardItemResponseDto.builder()
                        .type("OPINION")
                        .id(opinion.getId())
                        .title(opinion.getTitle())
                        .content(opinion.getContent())
                        .likeCount(opinion.getLikeCount())
                        .viewCount(opinion.getViewCount())
                        .status(opinion.getStatus())
                        .createdAt(opinion.getCreatedAt())
                        .name(opinion.getUser() != null ? opinion.getUser().getName() : "익명")
                        .answer(resolveOpinionAnswer(opinion, directAnswerMap, clusterAnswerMap))
                        .build())
                .toList();
    }

    private List<BoardItemResponseDto> buildClusterItems(
            List<ClusterEntity> clusters,
            Map<Long, AnswerResponseDto> answerMap
    ) {
        return clusters.stream()
                .map(cluster -> BoardItemResponseDto.builder()
                        .type("CLUSTER")
                        .id(cluster.getId())
                        .title(cluster.getTitle())
                        .content(cluster.getContent())
                        .status(cluster.getStatus())
                        .createdAt(cluster.getCreatedAt())
                        .answer(answerMap.get(cluster.getId()))
                        .opinionCount(cluster.getOpinionCount())
                        .build())
                .toList();
    }

    private AnswerResponseDto resolveOpinionAnswer(
            OpinionEntity opinion,
            Map<Long, AnswerResponseDto> directAnswerMap,
            Map<Long, AnswerResponseDto> clusterAnswerMap
    ) {
        AnswerResponseDto directAnswer = directAnswerMap.get(opinion.getId());
        if (directAnswer != null) {
            return directAnswer;
        }

        if (opinion.getCluster() == null) {
            return null;
        }

        return clusterAnswerMap.get(opinion.getCluster().getId());
    }

    private float cosineSimilarity(float[] left, float[] right) {
        if (left.length != right.length) {
            throw new IllegalArgumentException("벡터 길이가 서로 다릅니다.");
        }

        double dot = 0.0;
        double leftNorm = 0.0;
        double rightNorm = 0.0;

        for (int i = 0; i < left.length; i++) {
            dot += left[i] * right[i];
            leftNorm += left[i] * left[i];
            rightNorm += right[i] * right[i];
        }

        if (leftNorm == 0.0 || rightNorm == 0.0) {
            return 0.0f;
        }

        return (float) (dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)));
    }



} //class end
