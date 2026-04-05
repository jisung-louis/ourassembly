package com.team3.ourassembly.domain.bill.entity;

import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 의안 기본 정보와 의안 진행 상태를 저장하는 엔티티.
 * 목록 API와 상세 API의 공통 정보를 이 테이블에 모으고,
 * 화면에서 바로 사용할 수 있는 현재 단계/결과도 함께 저장한다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "bill")
public class BillEntity extends BaseTime {
    /** 국회 Open API가 부여하는 의안 고유 식별자. */
    @Id
    @Column(nullable = false, length = 64)
    private String billId;

    /** 사람이 보는 의안번호. 같은 대수 안에서 검색/표시에 사용된다. */
    @Column(nullable = false, length = 32)
    private String billNo;

    /** 의안명. 목록과 상세 화면의 기본 제목으로 사용한다. */
    @Column(nullable = false)
    private String billName;

    /** 제안일. 의안이 처음 발의된 날짜다. */
    @Column
    private LocalDate proposeDate;

    /** 소관위원회 이름. 별도 위원회 테이블 FK 대신 문자열로 스냅샷 저장한다. */
    @Column
    private String committeeName;

    /** 국회 상세 페이지 링크. 외부 원문 확인 용도로 사용한다. */
    @Column(columnDefinition = "TEXT")
    private String detailLink;

    /** 소관위원회 회부일. 소관위 단계 진입 시점을 뜻한다. */
    @Column
    private LocalDate committeeReferredDate;

    /** 소관위원회 상정일. 소관위 심사 테이블에 실제로 올라간 날짜다. */
    @Column
    private LocalDate committeePresentedDate;

    /** 소관위원회 처리일. 소관위 심사가 끝난 날짜다. */
    @Column
    private LocalDate committeeProcessedDate;

    /** 소관위원회 처리 결과. 예: 수정가결, 대안반영폐기 */
    @Column
    private String committeeProcessResult;

    /** 법사위 회부일. 체계자구심사를 위해 법사위로 넘어간 날짜다. */
    @Column
    private LocalDate lawReferredDate;

    /** 법사위 상정일. 법사위 심사가 실제로 시작된 날짜다. */
    @Column
    private LocalDate lawPresentedDate;

    /** 법사위 처리일. 법사위 심사가 종료된 날짜다. */
    @Column
    private LocalDate lawProcessedDate;

    /** 법사위 처리 결과. 예: 원안가결, 수정가결 */
    @Column
    private String lawProcessResult;

    /** 본회의 상정일. 본회의 안건으로 올라간 날짜다. */
    @Column
    private LocalDate plenaryPresentedDate;

    /** 본회의 의결일. 본회의에서 최종 처리된 날짜다. */
    @Column
    private LocalDate plenaryResolvedDate;

    /** 본회의 회의명. 어떤 회의에서 처리됐는지 보여줄 때 사용한다. */
    @Column
    private String plenaryConferenceName;

    /** 본회의 처리 결과. 예: 원안가결, 수정가결, 부결 */
    @Column
    private String plenaryResult;

    /** 정부 이송일. 국회를 통과한 의안이 정부로 이송된 날짜다. */
    @Column
    private LocalDate governmentTransferDate;

    /** 공포 후 확정된 법률명. 법률안이 법률로 전환됐을 때만 채워진다. */
    @Column
    private String promulgationLawName;

    /** 공포일. 이 값이 있으면 입법 절차가 사실상 완료된 상태다. */
    @Column
    private LocalDate promulgationDate;

    /** 공포번호. 공포 법률 식별용 값이다. */
    @Column
    private String promulgationNo;

    /** 날짜 필드를 바탕으로 계산한 현재 진행 단계. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private BillStage currentStage;

    /** 가장 최근 처리 결과 문자열을 바탕으로 계산한 현재 결과 상태. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private BillResult currentResult;

    /** 의안상세 Open API를 호출한 가장 마지막 날짜 **/
    @Column
    private LocalDate lastDetailOpenApiCalledAt;

    /** 의안 주요 내용 요약 (LLM 활용) **/
    @Column(columnDefinition = "Text")
    private String summary;

    /** 의안 주요 내용 요약 생성 상태 **/
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BillSummaryStatus summaryStatus;
}
