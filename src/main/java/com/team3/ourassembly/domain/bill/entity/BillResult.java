package com.team3.ourassembly.domain.bill.entity;

/**
 * 의안의 최신 처리 결과를 정규화한 값.
 * 원본 문자열은 BillEntity의 각 결과 필드에 남겨두고,
 * 서비스에서는 이 enum으로 화면/필터링에 쓰기 쉽게 만든다.
 */
public enum BillResult {
    /** 아직 처리 결과가 나오지 않은 진행중 상태 */
    PENDING,
    /** 가결 계열이지만 세부 유형을 정확히 분류하지 못한 경우 */
    PASSED,
    /** 원안 그대로 가결된 경우 */
    ORIGINAL_PASSED,
    /** 수정 후 가결된 경우 */
    AMENDED_PASSED,
    /** 대안이 채택되면서 기존 안이 폐기된 경우 */
    ALTERNATIVE_DISCARDED,
    /** 폐기 처리되었지만 대안반영폐기 여부를 구분하지 못한 경우 */
    DISCARDED,
    /** 제안자가 의안을 철회한 경우 */
    WITHDRAWN,
    /** 심사 또는 표결에서 부결된 경우 */
    REJECTED,
    /** 위 분류에 넣기 어려운 기타 결과 문자열 */
    OTHER
}
