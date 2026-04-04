package com.team3.ourassembly.domain.bill.entity;

/**
 * 의안이 현재 어느 절차 단계에 있는지 나타내는 값.
 * 각 날짜 필드 중 가장 뒤에 도달한 지점을 기준으로 계산한다.
 */
public enum BillStage {
    /** 발의만 되었고 상임위 회부 전인 상태 */
    PROPOSED,
    /** 소관위원회에 회부된 상태 */
    COMMITTEE_REFERRED,
    /** 소관위원회에 상정되어 심사 중인 상태 */
    COMMITTEE_PRESENTED,
    /** 소관위원회 심사가 완료된 상태 */
    COMMITTEE_PROCESSED,
    /** 법사위 체계자구심사로 회부된 상태 */
    LAW_REFERRED,
    /** 법사위에 상정되어 심사 중인 상태 */
    LAW_PRESENTED,
    /** 법사위 심사가 완료된 상태 */
    LAW_PROCESSED,
    /** 본회의에 상정된 상태 */
    PLENARY_PRESENTED,
    /** 본회의 의결까지 완료된 상태 */
    PLENARY_RESOLVED,
    /** 정부로 이송된 상태 */
    GOVERNMENT_TRANSFERRED,
    /** 공포까지 완료된 최종 상태 */
    PROMULGATED
}
