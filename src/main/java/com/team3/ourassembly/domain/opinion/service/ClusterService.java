package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.opinion.entity.ClusterEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import com.team3.ourassembly.domain.opinion.entity.OpinionVectorEntity;
import com.team3.ourassembly.domain.opinion.repository.ClusterRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionVectorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smile.clustering.KMeans;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ClusterService {
    private static final int MIN_CLUSTERING_SIZE = 300;

    private final CongressmanRepository congressmanRepository;
    private final ClusterRepository clusterRepository;
    private final OpinionRepository opinionRepository;
    private final OpinionVectorRepository opinionVectorRepository;
    private final ClusterSummaryService clusterSummaryService;

    @Transactional
    public boolean startClustering(String congressmanId) {
        CongressmanEntity congressman = congressmanRepository.findByIdForUpdate(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException("없는 국회의원입니다."));

        // 이미 작업 중이면 중복 클러스터링하지 않음
        if (Boolean.TRUE.equals(congressman.getClusteringInProgress())) {
            return false;
        }

        congressman.setClusteringInProgress(true);
        return true;
    }

    @Transactional
    public boolean clusterCongressman(String congressmanId){
        CongressmanEntity congressman = congressmanRepository.findById(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException("없는 국회의원입니다."));

        // 이미 답변된 개별의견, 이미 답변된 클러스터 제외하고 후보 벡터 조회
        List<OpinionVectorEntity> vectorEntities =
                opinionVectorRepository.findClusteringCandidates(congressmanId);

        // 후보가 300개 미만이면 클러스터링하지 않음
        if (vectorEntities.size() < MIN_CLUSTERING_SIZE) {
            return false;
        }

        // 기존 미답변 클러스터 먼저 해체
        clearOldClusters(vectorEntities);

        int k = Math.max(3, vectorEntities.size() / 60); // 묶을 개수 // 한 클러스터에 60개정도로
        k = Math.min(k, vectorEntities.size());

        List<float[]> vectors = vectorEntities.stream().map(OpinionVectorEntity::getVectorData).toList();

        double[][] data = vectors.stream().map(this::toDouble).toArray(double[][]::new); // List<float[]>를 double[][]로 바꿈

        KMeans kmeans = KMeans.fit(data, k);
        int[] labels = kmeans.y;


        Map<Integer, List<ClusterMember>> grouped = new HashMap<>();

        for (int i = 0; i < labels.length; i++) {
            int clusterIndex = labels[i];
            OpinionVectorEntity vectorEntity = vectorEntities.get(i);
            OpinionEntity opinion = vectorEntity.getOpinion();
            float[] centroid = toFloat(kmeans.centroids[clusterIndex]);
            float similarity = cosineSimilarity(vectorEntity.getVectorData(), centroid);

            grouped.computeIfAbsent(clusterIndex, key -> new ArrayList<>())
                    .add(new ClusterMember(opinion, similarity));
        }

        // 새 클러스터 저장 후 의견 재매핑
        saveNewClusters(congressman, grouped, kmeans.centroids);

        return true;
    }

    @Transactional
    public void finishClustering(String congressmanId, boolean clustered) {
        CongressmanEntity congressman = congressmanRepository.findByIdForUpdate(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException("없는 국회의원입니다."));

        // 첫 클러스터링 성공 여부 저장
        if (clustered) {
            congressman.setClusteringStarted(true);
        }

        congressman.setClusteringInProgress(false);
    }

    private void clearOldClusters(List<OpinionVectorEntity> vectorEntities) {
        List<Long> clusterIds = vectorEntities.stream()
                .map(OpinionVectorEntity::getOpinion)
                .map(OpinionEntity::getCluster)
                .filter(Objects::nonNull)
                .map(ClusterEntity::getId)
                .distinct()
                .toList();

        if (clusterIds.isEmpty()) {
            return;
        }

        // 기존 클러스터에 연결된 의견 먼저 분리
        List<OpinionEntity> clusteredOpinions = opinionRepository.findAllByCluster_idIn(clusterIds);
        for (OpinionEntity opinion : clusteredOpinions) {
            opinion.setCluster(null);
            opinion.setSimilarityScore(null);
        }

        opinionRepository.flush();

        // 분리된 기존 미답변 클러스터 삭제
        clusterRepository.deleteAllByIdInBatch(clusterIds);
    }

    private void saveNewClusters(
            CongressmanEntity congressman,
            Map<Integer, List<ClusterMember>> grouped,
            double[][] centroids
    ) {
        for (Map.Entry<Integer, List<ClusterMember>> entry : grouped.entrySet()) {
            int clusterIndex = entry.getKey();
            List<ClusterMember> members = entry.getValue();
            List<ClusterMember> representatives = findTopRepresentatives(members);
            String fallbackTitle = buildFallbackTitle(representatives, members.size());
            String fallbackContent = buildFallbackContent(representatives);
            ClusterSummaryService.ClusterSummary summary = clusterSummaryService.summarize(
                    representatives.stream().map(ClusterMember::opinion).toList(),
                    fallbackTitle,
                    fallbackContent
            );

            ClusterEntity cluster = clusterRepository.save(
                    ClusterEntity.builder()
                            .congressman(congressman)
                            .title(summary.title())
                            .content(summary.content())
                            .status("OPEN")
                            .opinionCount(members.size())
                            .centroidVector(toFloat(centroids[clusterIndex]))
                            .build()
            );

            for (ClusterMember member : members) {
                member.opinion().setCluster(cluster);
                member.opinion().setSimilarityScore(member.similarity());
            }
        }

    }

    private List<ClusterMember> findTopRepresentatives(List<ClusterMember> members) {
        // 중심값에 가장 가까운 의견 3개를 대표 의견으로 사용
        return members.stream()
                .sorted(Comparator.comparingDouble(ClusterMember::similarity).reversed())
                .limit(3)
                .toList();
    }

    private String buildFallbackTitle(List<ClusterMember> representatives, int opinionCount) {
        if (representatives.isEmpty()) {
            return "관련 의견 " + opinionCount + "건";
        }

        String title = representatives.get(0).opinion().getTitle();

        // 대표 제목이 있으면 묶음 개수를 같이 표시
        if (title != null && !title.isBlank()) {
            return opinionCount > 1 ? title + " 외 " + (opinionCount - 1) + "건" : title;
        }

        return "관련 의견 " + opinionCount + "건";
    }

    private String buildFallbackContent(List<ClusterMember> representatives) {
        // 중심값에 가까운 상위 3개 의견 내용을 함께 저장
        return representatives.stream()
                .map(ClusterMember::opinion)
                .map(OpinionEntity::getContent)
                .filter(Objects::nonNull)
                .filter(content -> !content.isBlank())
                .reduce((left, right) -> left + "\n\n" + right)
                .orElse("");
    }

    private float[] toFloat(double[] vec) {
        float[] result = new float[vec.length];
        for (int i = 0; i < vec.length; i++) {
            result[i] = (float) vec[i];
        }
        return result;
    }

    // 코사인 유사도 계산
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


    private double[] toDouble(float[] vec) {
        double[] result = new double[vec.length];
        for (int i = 0; i < vec.length; i++) {
            result[i] = vec[i];
        }
        return result;
    }

    private record ClusterMember(
            OpinionEntity opinion,
            float similarity
    ) {
    }
}
/*
    [클러스터]
    개요 : 약 10_000개(예시)의 의견 중 비슷한 의견끼리 묶어 50개(예시) 정도로 묶어서 줄임
    1. 1시간마다 클러스터링함

    클러스터링 의견 기준
    1. 이미 답변된 개별의견은 클러스터링에서 제외
    2. 이미 답변된 클러스터는 재클러스터링에서 재외
    3. 모든 클러스터 해체하고 다시 클러스터링
 */
