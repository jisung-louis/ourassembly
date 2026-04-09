package com.team3.ourassembly.domain.opinion.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClusterAsyncService {
    private final ClusterService clusterService;

    @Async
    public void triggerClustering(String congressmanId) {
        boolean started = clusterService.startClustering(congressmanId);

        if (!started) {
            return;
        }

        boolean clustered = false;

        try {
            // 비동기 스레드에서 실제 클러스터링 실행
            clustered = clusterService.clusterCongressman(congressmanId);
        } catch (Exception exception) {
            log.error("클러스터링 작업 중 오류가 발생했습니다. congressmanId={}", congressmanId, exception);
        } finally {
            clusterService.finishClustering(congressmanId, clustered);
        }
    }
}
