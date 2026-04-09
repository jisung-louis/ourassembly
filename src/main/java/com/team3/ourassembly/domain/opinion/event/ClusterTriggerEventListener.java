package com.team3.ourassembly.domain.opinion.event;

import com.team3.ourassembly.domain.opinion.service.ClusterAsyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ClusterTriggerEventListener {
    private final ClusterAsyncService clusterAsyncService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleClusterTrigger(ClusterTriggerEvent event) {
        clusterAsyncService.triggerClustering(event.congressmanId());
    }
}
