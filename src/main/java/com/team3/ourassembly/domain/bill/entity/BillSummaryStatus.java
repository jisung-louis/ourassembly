package com.team3.ourassembly.domain.bill.entity;

/**
 * 의안 요약 생성 상태.
 * 상세 Open API 응답과 LLM 요약 응답을 분리하기 위해 사용한다.
 */
public enum BillSummaryStatus {
    /** 아직 요약 생성을 시작하지 않은 상태 */
    NOT_REQUESTED,
    /** 요약 생성 작업이 진행 중인 상태 */
    PENDING,
    /** 요약 생성이 완료된 상태 */
    COMPLETED,
    /** 요약 생성에 실패한 상태 */
    FAILED
}
