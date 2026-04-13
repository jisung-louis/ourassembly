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

import java.util.*;

@Service
@RequiredArgsConstructor
public class ClusterService {
    private static final int MIN_CLUSTERING_SIZE = 300;

    private final CongressmanRepository congressmanRepository;
    private final ClusterRepository clusterRepository;
    private final OpinionRepository opinionRepository;
    private final OpinionVectorRepository opinionVectorRepository;
    private final ClusterSummaryService clusterSummaryService;

    // 클러스터 발동 전 함수
    // 1. 국회의원이 존재하는지 체크 (존재하지 않으면 error) (비관적 lock : 이 함수 트랜잭션이 모두 끝날 때 까지 다른 스레드에서 이 회원 row를 읽지 못하게 막아둠.)
    // 2. 이미 작업중인지 체크 (작업중이면 false)
    // 3. congressman 테이블의 clusteringInProgress 칼럼을 true로 set
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
        // 1. 국회의원이 존재하는지 체크 (존재하지 않으면 error)
        CongressmanEntity congressman = congressmanRepository.findById(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException("없는 국회의원입니다."));

        // 2. 이미 답변된 개별의견, 이미 답변된 클러스터 제외하고 후보 벡터 조회
        List<OpinionVectorEntity> vectorEntities =
                opinionVectorRepository.findClusteringCandidates(congressmanId);

        // 2-1. 후보가 300개 미만이면 클러스터링하지 않음
        if (vectorEntities.size() < MIN_CLUSTERING_SIZE) {
            System.out.println("후보가 300개 미만이라 클러스팅 안함, 후보 : " + vectorEntities.size() + " 개");
            return false;
        }

        // 3. 기존 미답변 클러스터 먼저 해체
        clearOldClusters(vectorEntities);

        // 4. 클러스터(묶을) 개수 설정(k)
        int k = Math.max(3, vectorEntities.size() / 60); // 한 클러스터에 60개정도로
        k = Math.min(k, vectorEntities.size()); // k가 벡터엔티티 사이즈보다 커지는 경우 방어

        // 5. 의견 벡터 테이블의 벡터데이터만 추출해서 List<float[]>에 넣음
        List<float[]> vectors = vectorEntities.stream()
                .map(OpinionVectorEntity::getVectorData)
                .toList();

        // 6. List<float[]> 타입의 데이터를 double[][] 형식으로 형변환
        // (K-Means의 fit 함수의 벡터데이터의 타입은 double[][]을 받기 떄문)
        double[][] data = vectors.stream()
                .map(this::toDouble)
                .toArray(double[][]::new); // List<float[]>를 double[][]로 바꿈

        KMeans kmeans = KMeans.fit(data, k);
        int[] labels = kmeans.y; // ex : [1, 0, 0, 4, ...] -> 0번째 vector데이터가 속한 클러스터는 1번, 1번째 vector데이터가 속한 클러스터는 0번, ...

        // 7. 클러스터링된 출력 결과물(레이블)로 반복 사이클을 돌려 HashMap에 군집별로 실제 벡터 데이터를 저장한다.
        Map<Integer, List<ClusterMember>> grouped = new HashMap<>();
        for (int i = 0; i < labels.length; i++) {
            int clusterIndex = labels[i];
            OpinionVectorEntity vectorEntity = vectorEntities.get(i);
            OpinionEntity opinion = vectorEntity.getOpinion();
            float[] centroid = toFloat(kmeans.centroids[clusterIndex]);
            float similarity = cosineSimilarity(vectorEntity.getVectorData(), centroid); // 코사인 유사도. 방향적(의미적) 유사도를 나타냄. (-1 ~ 1)

            if(similarity < 0.6f) { continue; } // 유사도가 60% 미만인 의견은 클러스터에 넣지 않고 개별 의견으로 탈락됨.

            grouped.computeIfAbsent(clusterIndex, key -> new ArrayList<>())
                    .add(new ClusterMember(opinion, similarity));
        }

        // 8. 새 클러스터 저장 후 의견 재매핑
        saveNewClusters(congressman, grouped, kmeans.centroids);

        return true;
    }

    @Transactional
    public void finishClustering(String congressmanId, boolean clustered) {
        CongressmanEntity congressman = congressmanRepository.findByIdForUpdate(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException("없는 국회의원입니다."));

        System.out.println(congressmanId + " 의 클러스터 여부 저장 중");
        // 첫 클러스터링 성공 여부 저장
        if (clustered) {
            congressman.setClusteringStarted(true);
            System.out.println(congressmanId + " 의 클러스터 여부 저장 성공");
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
            // LLM에 대표 3개 의견(그리고 오류 발생시 대체할 fallbackTitle, fallbackContent까지) 넘겨서 요약 요청후 record에 title, content저장
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
    // 개별 의견 벡터와 클러스터 중심 벡터가 얼마나 비슷한 "방향"인지 계산후,  그 의견이 해당 클러스터를 얼마나 잘 대표하는지 판단
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
