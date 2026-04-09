package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ClusterScheduler {
    private static final int MIN_CLUSTERING_SIZE = 300;

    private final OpinionRepository opinionRepository;
    private final ClusterAsyncService clusterAsyncService;

    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void reclusterOpinions() {
        List<String> congressmanIds = opinionRepository.findCongressmanIdsWithNotClosedCountAtLeast(MIN_CLUSTERING_SIZE);

        // 1시간마다 300개 이상인 의원만 재클러스터링
        for (String congressmanId : congressmanIds) {
            clusterAsyncService.triggerClustering(congressmanId);
        }
    }
}
