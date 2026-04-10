package com.team3.ourassembly.domain.bill.service;

import com.team3.ourassembly.domain.alarm.entity.FollowEntity;
import com.team3.ourassembly.domain.alarm.repository.FollowRepository;
import com.team3.ourassembly.domain.alarm.service.NotificationService;
import com.team3.ourassembly.domain.bill.dto.BillDetailResponse;
import com.team3.ourassembly.domain.bill.dto.BillProposerResponse;
import com.team3.ourassembly.domain.bill.dto.BillSummaryResponse;
import com.team3.ourassembly.domain.bill.dto.BillSyncResponse;
import com.team3.ourassembly.domain.bill.entity.BillEntity;
import com.team3.ourassembly.domain.bill.entity.BillProposerEntity;
import com.team3.ourassembly.domain.bill.entity.BillProposerRole;
import com.team3.ourassembly.domain.bill.entity.BillResult;
import com.team3.ourassembly.domain.bill.entity.BillStage;
import com.team3.ourassembly.domain.bill.entity.BillSummaryStatus;
import com.team3.ourassembly.domain.bill.repository.BillProposerRepository;
import com.team3.ourassembly.domain.bill.repository.BillRepository;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 국회 Open API에서 의안 정보를 읽어 bill / bill_proposer 테이블에 반영하는 서비스.
 * 목록 API는 의안 기본정보와 발의자 매핑을 만들고,
 * 상세 API는 사용자가 특정 의안 상세를 조회할 때만 호출해 bill 상태를 최신화한다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BillDataService {
    /** 의안 기본정보 upsert용 리포지토리 */
    private final BillRepository billRepository;
    /** 의안-제안자 매핑 저장용 리포지토리 */
    private final BillProposerRepository billProposerRepository;
    /** MONA_CD를 congressman PK에 연결하기 위한 리포지토리 */
    private final CongressmanRepository congressmanRepository;
    /** 의안 요약 비동기 생성 서비스 */
    private final BillSummaryAsyncService billSummaryAsyncService;

    /**알림 연결 서비스*/
    private final NotificationService notificationService;
    /**팔로우 연결 서비스*/
    private final FollowRepository followRepository;

    /** 국회 Open API 호출용 HTTP 클라이언트 */
    private final WebClient webClient = WebClient.builder().build();
    /** JSON 응답을 Map 구조로 파싱하기 위한 객체 */
    private final ObjectMapper objectMapper = new ObjectMapper();
    /** 스케줄러와 수동 실행이 동시에 겹치지 않도록 막는 플래그 */
    private final AtomicBoolean syncing = new AtomicBoolean(false);

    /** 국회 Open API 인증키 */
    @Value("${assembly.open-api.key}")
    private String key;

    /** 의안 목록 API endpoint 이름 */
    @Value("${assembly.open-api.bill-list-endpoint:nzmimeepazxkubdpn}")
    private String billListEndpoint;

    /** 의안 상세 API endpoint 이름 */
    @Value("${assembly.open-api.bill-detail-endpoint:BILLINFODETAIL}")
    private String billDetailEndpoint;

    /** 의안 스케줄 동기화 on/off 설정값 */
    @Value("${bill.sync.enabled:true}")
    private boolean billSyncEnabled;

    /** 현재 서비스에서 다루는 기본 대수. 일단 22대로 고정한다. */
    private final Integer defaultAge = 22;

    /**
     * 매일 오전 9시에 실행되는 정기 동기화 엔트리 포인트.
     * 스케줄을 끄면 바로 종료하고, 켜져 있으면 22대 의안 목록과 제안자 매핑만 동기화한다.
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void syncBillsByScheduler() {
        if (!billSyncEnabled) {
            System.out.println("[LOG] 의안 스케줄 동기화가 비활성화되어 실행하지 않습니다.");
            return;
        }
        System.out.println("[LOG] 오전 9시 정기 의안 동기화를 시작합니다.");
        syncBills(defaultAge, "scheduler");
    }

    /**
     * 의안 목록 API를 호출해 의안 목록과 발의자 매핑을 최신 상태로 맞춘다.
     * 상세 API는 전체 sync에서 호출하지 않고, 사용자가 특정 의안 상세를 조회할 때만 호출한다.
     *
     * @param age 조회할 국회 대수
     * @param triggeredBy 수동 실행인지 스케줄 실행인지 구분하기 위한 메타 정보
     * @return 동기화 건수 요약
     */
    public BillSyncResponse syncBills(Integer age, String triggeredBy) {
        if (!syncing.compareAndSet(false, true)) {
            throw new IllegalStateException("의안 동기화가 이미 실행 중입니다.");
        }

        try {
            System.out.println("[LOG] 의안 동기화를 시작합니다. 대수=" + age + ", 실행주체=" + triggeredBy);
            List<Map<String, Object>> billRows = getBillListRawInfo(age);
            System.out.println("[LOG] " + age + "대 의안 목록 조회 완료: 총 " + billRows.size() + "건");
            int proposerMappingCount = 0;
            int processed = 0;

            for (Map<String, Object> row : billRows) {
                processed++;
                String billId = getString(row, "BILL_ID");
                String billNo = getString(row, "BILL_NO");
                String billName = firstNonBlank(getString(row, "BILL_NAME"), getString(row, "BILL_NM"));
                String billLabel = formatBillLabel(billId, billNo, billName);

                boolean isNew = !billRepository.existsById(billId);

                System.out.println("[LOG] " + processed + "번째 의안 동기화 시작 - " + billLabel);
                BillEntity bill = upsertBillFromListRow(row, age);
                int mappedProposerCount = upsertBillProposers(bill, row);
                proposerMappingCount += mappedProposerCount;

                if (isNew) {
                    try {
                        List<BillProposerEntity> leadProposers = billProposerRepository.findByBillAndRole(bill, BillProposerRole.LEAD);
                        String billUrl = "/bill/detail/" + bill.getBillId();
                        for (BillProposerEntity proposer : leadProposers) {
                            CongressmanEntity congressman = proposer.getCongressman();
                            List<FollowEntity> followers = followRepository.findByCongressman(congressman);
                            for (FollowEntity follow : followers) {
                                notificationService.sendAndSave(
                                        follow.getUser(),
                                        congressman,
                                        "새 법안 발의 알림",
                                        congressman.getName() + " 의원이 새 법안을 발의했습니다: " + bill.getBillName(),
                                        billUrl
                                );
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("[ERROR] 법안 알림 발송 실패: " + e.getMessage());
                    }
                }

                System.out.println("[LOG] " + billLabel + " 제안자 매핑 완료: " + mappedProposerCount + "건");
                System.out.println("[LOG] " + processed + "번째 의안 동기화 종료 - " + billLabel);
            }

            System.out.println("[LOG] 의안 동기화가 완료되었습니다. 총 의안=" + billRows.size()
                    + "건, 제안자 매핑=" + proposerMappingCount + "건");

            return BillSyncResponse.builder()
                    .age(age)
                    .billCount(billRows.size())
                    .detailUpdatedCount(0)
                    .proposerMappingCount(proposerMappingCount)
                    .triggeredBy(triggeredBy)
                    .build();
        } finally {
            syncing.set(false);
        }
    }

    /**
     * 의안 목록 API를 페이지 단위로 끝까지 호출해 특정 대수의 의안 목록을 전부 가져온다.
     *
     * @param age 조회할 국회 대수
     * @return 목록 API의 raw row 리스트
     */
    public List<Map<String, Object>> getBillListRawInfo(Integer age) {
        List<Map<String, Object>> allRows = new ArrayList<>();
        int pageIndex = 1;
        int pageSize = 200;
        int totalCount = Integer.MAX_VALUE;

        while ((pageIndex - 1) * pageSize < totalCount) {
            System.out.println("[LOG] 의안 목록 API 호출 중 - 대수=" + age + ", 페이지=" + pageIndex + ", 페이지크기=" + pageSize);
            Map<String, Object> payload = callApi(
                    billListEndpoint,
                    Map.of(
                            "Type", "json",
                            "Key", key,
                            "pIndex", String.valueOf(pageIndex),
                            "pSize", String.valueOf(pageSize),
                            "AGE", String.valueOf(age)
                    )
            );

            totalCount = extractListTotalCount(payload, billListEndpoint);
            List<Map<String, Object>> rows = extractRows(payload, billListEndpoint);
            System.out.println("[LOG] 의안 목록 API 응답 완료 - 페이지=" + pageIndex + ", 조회건수=" + rows.size() + ", 전체건수=" + totalCount);

            if (rows.isEmpty()) {
                break;
            }

            allRows.addAll(rows);
            pageIndex++;
        }

        return allRows;
    }

    /**
     * 단일 의안에 대한 상세 정보를 상세 API에서 가져온다.
     *
     * @param billId 의안ID
     * @return 상세 API의 첫 번째 row. 없으면 빈 Map 반환
     */
    public Map<String, Object> getBillDetailRawInfo(String billId) {
        Map<String, Object> payload = callApi(
                billDetailEndpoint,
                Map.of(
                        "Type", "json",
                        "Key", key,
                        "BILL_ID", billId
                )
        );

        List<Map<String, Object>> rows = extractRows(payload, billDetailEndpoint);
        if (rows.isEmpty()) {
            return Collections.emptyMap();
        }
        return rows.get(0);
    }

    /**
     * 사용자가 특정 의안 상세 화면에 진입할 때 호출되는 조회 메서드.
     * 매번 국회 상세 API를 호출해 bill 테이블을 최신 상태로 갱신한 뒤,
     * 최신 bill 정보와 제안자 목록을 함께 반환한다.
     *
     * @param billId 의안ID
     * @return 최신 상세 정보 응답
     */
    public BillDetailResponse getBillDetail(String billId) {
        System.out.println("[LOG] 의안 상세 조회를 시작합니다. billId=" + billId);
        refreshBillDetail(billId);

        BillEntity bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("의안을 찾을 수 없습니다. billId=" + billId));
        triggerSummaryGenerationIfNeeded(bill);

        List<BillProposerResponse> proposers = billProposerRepository.findByBillWithCongressmanOrderBySortOrderAsc(bill).stream()
                .map(this::toBillProposerResponse)
                .toList();

        System.out.println("[LOG] 의안 상세 조회를 완료했습니다. " + formatBillLabel(bill.getBillId(), bill.getBillNo(), bill.getBillName()));
        return toBillDetailResponse(bill, proposers);
    }

    /**
     * 현재 저장된 의안 요약과 생성 상태만 조회한다.
     * 요약이 아직 없으면 비동기 생성 작업을 시작하고, 현재 저장 상태를 즉시 반환한다.
     */
    public BillSummaryResponse getBillSummary(String billId) {
        BillEntity bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("의안을 찾을 수 없습니다. billId=" + billId));
        triggerSummaryGenerationIfNeeded(bill);

        BillEntity latestBill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("의안을 찾을 수 없습니다. billId=" + billId));

        return BillSummaryResponse.builder()
                .billId(latestBill.getBillId())
                .summary(latestBill.getSummary())
                .summaryStatus(resolveSummaryStatus(latestBill))
                .build();
    }

    /**
     * 목록 API row를 기준으로 bill 기본정보를 upsert한다.
     * 이 단계에서는 의안 제목, 제안일, 소관위, 현재까지 노출된 처리 결과 일부만 저장한다.
     */
    private BillEntity upsertBillFromListRow(Map<String, Object> row, Integer age) {
        String billId = getString(row, "BILL_ID");
        if (billId == null || billId.isBlank()) {
            throw new IllegalArgumentException("BILL_ID가 비어 있는 의안은 저장할 수 없습니다.");
        }

        Optional<BillEntity> existingBill = billRepository.findById(billId);
        boolean created = existingBill.isEmpty();
        BillEntity bill = existingBill
                .orElseGet(() -> BillEntity.builder().billId(billId).build());

        bill.setBillNo(pickValue(getString(row, "BILL_NO"), bill.getBillNo()));
        bill.setBillName(pickValue(firstNonBlank(getString(row, "BILL_NAME"), getString(row, "BILL_NM")), bill.getBillName()));
        bill.setProposeDate(pickDate(firstNonBlank(getString(row, "PROPOSE_DT"), getString(row, "PPSL_DT")), bill.getProposeDate()));
        bill.setCommitteeName(pickValue(firstNonBlank(getString(row, "COMMITTEE"), getString(row, "JRCMIT_NM")), bill.getCommitteeName()));
        bill.setDetailLink(pickValue(firstNonBlank(getString(row, "DETAIL_LINK"), getString(row, "LINK_URL")), bill.getDetailLink()));

        bill.setCommitteeReferredDate(pickDate(firstNonBlank(getString(row, "COMMITTEE_DT"), getString(row, "JRCMIT_CMMT_DT")), bill.getCommitteeReferredDate()));
        bill.setCommitteePresentedDate(pickDate(firstNonBlank(getString(row, "CMT_PRESENT_DT"), getString(row, "JRCMIT_PRSNT_DT")), bill.getCommitteePresentedDate()));
        bill.setCommitteeProcessedDate(pickDate(firstNonBlank(getString(row, "CMT_PROC_DT"), getString(row, "JRCMIT_PROC_DT")), bill.getCommitteeProcessedDate()));
        bill.setCommitteeProcessResult(pickValue(firstNonBlank(getString(row, "CMT_PROC_RESULT_CD"), getString(row, "JRCMIT_PROC_RSLT")), bill.getCommitteeProcessResult()));

        bill.setLawReferredDate(pickDate(firstNonBlank(getString(row, "LAW_SUBMIT_DT"), getString(row, "LAW_CMMT_DT")), bill.getLawReferredDate()));
        bill.setLawPresentedDate(pickDate(getString(row, "LAW_PRESENT_DT"), bill.getLawPresentedDate()));
        bill.setLawProcessedDate(pickDate(getString(row, "LAW_PROC_DT"), bill.getLawProcessedDate()));
        bill.setLawProcessResult(pickValue(firstNonBlank(getString(row, "LAW_PROC_RESULT_CD"), getString(row, "LAW_PROC_RSLT")), bill.getLawProcessResult()));

        bill.setPlenaryResolvedDate(pickDate(firstNonBlank(getString(row, "PROC_DT"), getString(row, "RGS_RSLN_DT")), bill.getPlenaryResolvedDate()));
        bill.setPlenaryResult(pickValue(firstNonBlank(getString(row, "PROC_RESULT"), getString(row, "PROC_RESULT_CD"), getString(row, "RGS_CONF_RSLT")), bill.getPlenaryResult()));

        if (bill.getCurrentStage() == null) {
            bill.setCurrentStage(BillStage.PROPOSED);
        }
        if (bill.getCurrentResult() == null) {
            bill.setCurrentResult(BillResult.PENDING);
        }

        bill.setCurrentStage(determineStage(bill));
        bill.setCurrentResult(determineResult(bill));
        BillEntity savedBill = billRepository.save(bill);
        System.out.println("[LOG] 의안 기본정보 " + (created ? "저장" : "갱신") + " 완료 - "
                + formatBillLabel(savedBill.getBillId(), savedBill.getBillNo(), savedBill.getBillName())
                + ", 현재단계=" + savedBill.getCurrentStage()
                + ", 현재결과=" + savedBill.getCurrentResult());
        return savedBill;
    }

    /**
     * 목록 API의 대표발의자/공동발의자 코드를 읽어 bill_proposer 매핑을 재구성한다.
     * congressman과 연결되는 경우만 저장한다.
     */
    private int upsertBillProposers(BillEntity bill, Map<String, Object> row) {
        billProposerRepository.deleteByBill(bill);
        System.out.println("[LOG] " + formatBillLabel(bill.getBillId(), bill.getBillNo(), bill.getBillName()) + " 기존 제안자 매핑 삭제 완료");

        List<BillProposerEntity> proposers = new ArrayList<>();
        int sortOrder = 0;

        List<String> leadCodes = splitCsv(getString(row, "RST_MONA_CD"));
        List<String> leadNames = splitCsv(firstNonBlank(getString(row, "RST_PROPOSER"), getString(row, "PROPOSER"), getString(row, "PPSR")));
        int leadCount = Math.max(leadCodes.size(), leadNames.size());
        for (int i = 0; i < leadCount; i++) {
            String monaCd = i < leadCodes.size() ? leadCodes.get(i) : null;
            String proposerName = i < leadNames.size() ? leadNames.get(i) : null;

            if (monaCd == null || monaCd.isBlank()) {
                continue;
            }

            createBillProposer(bill, monaCd, proposerName, BillProposerRole.LEAD, sortOrder++)
                    .ifPresent(proposers::add);
        }

        List<String> coCodes = splitCsv(getString(row, "PUBL_MONA_CD"));
        List<String> coNames = splitCsv(getString(row, "PUBL_PROPOSER"));
        int coCount = Math.max(coCodes.size(), coNames.size());
        for (int i = 0; i < coCount; i++) {
            String monaCd = i < coCodes.size() ? coCodes.get(i) : null;
            String proposerName = i < coNames.size() ? coNames.get(i) : null;

            if (monaCd == null || monaCd.isBlank()) {
                continue;
            }

            Optional<BillProposerEntity> billProposer = createBillProposer(bill, monaCd, proposerName, BillProposerRole.CO, sortOrder++);
            billProposer.ifPresent(proposers::add);
        }

        billProposerRepository.saveAll(proposers);
        System.out.println("[LOG] " + formatBillLabel(bill.getBillId(), bill.getBillNo(), bill.getBillName()) + " 새 제안자 매핑 저장 완료");
        return proposers.size();
    }

    /**
     * 단일 제안자 매핑 엔티티를 만든다.
     * MONA_CD로 congressman을 찾지 못하면 무결성을 위해 저장하지 않는다.
     */
    private Optional<BillProposerEntity> createBillProposer(BillEntity bill, String monaCd, String proposerName, BillProposerRole role, int sortOrder) {
        Optional<CongressmanEntity> congressman = congressmanRepository.findById(monaCd);
        if (congressman.isEmpty()) {
            System.out.println("[WARNING] billId=" + bill.getBillId() + " proposer를 congressman에서 찾지 못해 매핑을 건너뜁니다. monaCd=" + monaCd + ", name=" + proposerName);
            return Optional.empty();
        }

        return Optional.of(
                BillProposerEntity.builder()
                        .bill(bill)
                        .congressman(congressman.get())
                        .role(role)
                        .sortOrder(sortOrder)
                .build()
        );
    }

    /**
     * 상세 API row를 기준으로 의안의 심사 단계 원본 필드와 파생 상태를 갱신한다.
     *
     * @param billId 의안ID
     * @return 상세 정보를 정상 반영했으면 true, 상세 row가 없으면 false
     */
    private void refreshBillDetail(String billId) {
        BillEntity bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("의안을 찾을 수 없습니다. billId=" + billId));

//        LocalDate lastCalledAt = bill.getLastDetailOpenApiCalledAt();
//        LocalDate today = LocalDate.now();
//        if (lastCalledAt != null && lastCalledAt.isEqual(today)){ // 오늘 이미 Open API를 호출한 적이 있다면
//            return;
//        }

        Map<String, Object> detailRow = getBillDetailRawInfo(billId);
        if (detailRow.isEmpty()) {
            return;
        }

        bill.setBillNo(pickValue(getString(detailRow, "BILL_NO"), bill.getBillNo()));
        bill.setBillName(pickValue(firstNonBlank(getString(detailRow, "BILL_NM"), getString(detailRow, "BILL_NAME")), bill.getBillName()));
        bill.setProposeDate(pickDate(getString(detailRow, "PPSL_DT"), bill.getProposeDate()));
        bill.setCommitteeName(pickValue(getString(detailRow, "JRCMIT_NM"), bill.getCommitteeName()));

        bill.setCommitteeReferredDate(pickDate(getString(detailRow, "JRCMIT_CMMT_DT"), bill.getCommitteeReferredDate()));
        bill.setCommitteePresentedDate(pickDate(getString(detailRow, "JRCMIT_PRSNT_DT"), bill.getCommitteePresentedDate()));
        bill.setCommitteeProcessedDate(pickDate(getString(detailRow, "JRCMIT_PROC_DT"), bill.getCommitteeProcessedDate()));
        bill.setCommitteeProcessResult(pickValue(getString(detailRow, "JRCMIT_PROC_RSLT"), bill.getCommitteeProcessResult()));

        bill.setLawReferredDate(pickDate(getString(detailRow, "LAW_CMMT_DT"), bill.getLawReferredDate()));
        bill.setLawPresentedDate(pickDate(getString(detailRow, "LAW_PRSNT_DT"), bill.getLawPresentedDate()));
        bill.setLawProcessedDate(pickDate(getString(detailRow, "LAW_PROC_DT"), bill.getLawProcessedDate()));
        bill.setLawProcessResult(pickValue(getString(detailRow, "LAW_PROC_RSLT"), bill.getLawProcessResult()));

        bill.setPlenaryPresentedDate(pickDate(getString(detailRow, "RGS_PRSNT_DT"), bill.getPlenaryPresentedDate()));
        bill.setPlenaryResolvedDate(pickDate(getString(detailRow, "RGS_RSLN_DT"), bill.getPlenaryResolvedDate()));
        bill.setPlenaryConferenceName(pickValue(getString(detailRow, "RGS_CONF_NM"), bill.getPlenaryConferenceName()));
        bill.setPlenaryResult(pickValue(getString(detailRow, "RGS_CONF_RSLT"), bill.getPlenaryResult()));

        bill.setGovernmentTransferDate(pickDate(getString(detailRow, "GVRN_TRSF_DT"), bill.getGovernmentTransferDate()));
        bill.setPromulgationLawName(pickValue(getString(detailRow, "PROM_LAW_NM"), bill.getPromulgationLawName()));
        bill.setPromulgationDate(pickDate(getString(detailRow, "PROM_DT"), bill.getPromulgationDate()));
        bill.setPromulgationNo(pickValue(getString(detailRow, "PROM_NO"), bill.getPromulgationNo()));

        bill.setCurrentStage(determineStage(bill));
        bill.setCurrentResult(determineResult(bill));

        bill.setLastDetailOpenApiCalledAt(LocalDate.now());

        billRepository.save(bill);
        System.out.println("[LOG] " + formatBillLabel(bill.getBillId(), bill.getBillNo(), bill.getBillName())
                + " 진행상태 갱신 완료 - 단계=" + bill.getCurrentStage()
                + ", 결과=" + bill.getCurrentResult());
    }

    /**
     * bill 엔티티를 상세 조회 응답 DTO로 변환한다.
     */
    private BillDetailResponse toBillDetailResponse(BillEntity bill, List<BillProposerResponse> proposers) {
        return BillDetailResponse.builder()
                .billId(bill.getBillId())
                .billNo(bill.getBillNo())
                .billName(bill.getBillName())
                .proposeDate(bill.getProposeDate())
                .committeeName(bill.getCommitteeName())
                .detailLink(bill.getDetailLink())
                .committeeReferredDate(bill.getCommitteeReferredDate())
                .committeePresentedDate(bill.getCommitteePresentedDate())
                .committeeProcessedDate(bill.getCommitteeProcessedDate())
                .committeeProcessResult(bill.getCommitteeProcessResult())
                .lawReferredDate(bill.getLawReferredDate())
                .lawPresentedDate(bill.getLawPresentedDate())
                .lawProcessedDate(bill.getLawProcessedDate())
                .lawProcessResult(bill.getLawProcessResult())
                .plenaryPresentedDate(bill.getPlenaryPresentedDate())
                .plenaryResolvedDate(bill.getPlenaryResolvedDate())
                .plenaryConferenceName(bill.getPlenaryConferenceName())
                .plenaryResult(bill.getPlenaryResult())
                .governmentTransferDate(bill.getGovernmentTransferDate())
                .promulgationLawName(bill.getPromulgationLawName())
                .promulgationDate(bill.getPromulgationDate())
                .promulgationNo(bill.getPromulgationNo())
                .currentStage(bill.getCurrentStage())
                .currentResult(bill.getCurrentResult())
                .proposers(proposers)
                .summary(bill.getSummary())
                .summaryStatus(resolveSummaryStatus(bill))
                .build();
    }

    /**
     * 요약이 아직 없거나 실패 상태일 때만 비동기 요약 생성을 시작한다.
     */
    private void triggerSummaryGenerationIfNeeded(BillEntity bill) {
        BillSummaryStatus summaryStatus = resolveSummaryStatus(bill);
        boolean hasSummary = bill.getSummary() != null && !bill.getSummary().isBlank();

        if (hasSummary && summaryStatus == BillSummaryStatus.COMPLETED) {
            return;
        }

        if (summaryStatus == BillSummaryStatus.PENDING) {
            return;
        }

        bill.setSummaryStatus(BillSummaryStatus.PENDING);
        billRepository.save(bill);
        System.out.println("[LOG] 의안 요약 생성 작업을 시작합니다. billId=" + bill.getBillId());
        billSummaryAsyncService.generateSummaryAsync(bill.getBillId());
    }

    /**
     * DB에 저장된 summary / summaryStatus 조합을 기준으로 현재 요약 생성 상태를 계산한다.
     */
    private BillSummaryStatus resolveSummaryStatus(BillEntity bill) {
        if (bill.getSummaryStatus() != null) {
            return bill.getSummaryStatus();
        }

        if (bill.getSummary() != null && !bill.getSummary().isBlank()) {
            return BillSummaryStatus.COMPLETED;
        }

        return BillSummaryStatus.NOT_REQUESTED;
    }

    /**
     * 제안자 매핑 엔티티를 상세 조회 응답용 DTO로 변환한다.
     */
    private BillProposerResponse toBillProposerResponse(BillProposerEntity billProposer) {
        return BillProposerResponse.builder()
                .congressmanId(billProposer.getCongressman().getId())
                .name(billProposer.getCongressman().getName())
                .role(billProposer.getRole())
                .sortOrder(billProposer.getSortOrder())
                .build();
    }

    /**
     * 의안이 도달한 가장 마지막 날짜 필드를 기준으로 현재 단계를 계산한다.
     */
    private BillStage determineStage(BillEntity bill) {
        if (bill.getPromulgationDate() != null) {
            return BillStage.PROMULGATED;
        }
        if (bill.getGovernmentTransferDate() != null) {
            return BillStage.GOVERNMENT_TRANSFERRED;
        }
        if (bill.getPlenaryResolvedDate() != null) {
            return BillStage.PLENARY_RESOLVED;
        }
        if (bill.getPlenaryPresentedDate() != null) {
            return BillStage.PLENARY_PRESENTED;
        }
        if (bill.getLawProcessedDate() != null) {
            return BillStage.LAW_PROCESSED;
        }
        if (bill.getLawPresentedDate() != null) {
            return BillStage.LAW_PRESENTED;
        }
        if (bill.getLawReferredDate() != null) {
            return BillStage.LAW_REFERRED;
        }
        if (bill.getCommitteeProcessedDate() != null) {
            return BillStage.COMMITTEE_PROCESSED;
        }
        if (bill.getCommitteePresentedDate() != null) {
            return BillStage.COMMITTEE_PRESENTED;
        }
        if (bill.getCommitteeReferredDate() != null) {
            return BillStage.COMMITTEE_REFERRED;
        }
        return BillStage.PROPOSED;
    }

    /**
     * 가장 최근 처리 결과 문자열을 정규화해 서비스용 enum으로 변환한다.
     */
    private BillResult determineResult(BillEntity bill) {
        String raw = firstNonBlank(bill.getPlenaryResult(), bill.getLawProcessResult(), bill.getCommitteeProcessResult());
        if (raw == null || raw.isBlank()) {
            return BillResult.PENDING;
        }
        if (raw.contains("원안가결")) {
            return BillResult.ORIGINAL_PASSED;
        }
        if (raw.contains("수정가결")) {
            return BillResult.AMENDED_PASSED;
        }
        if (raw.contains("대안반영폐기")) {
            return BillResult.ALTERNATIVE_DISCARDED;
        }
        if (raw.contains("철회")) {
            return BillResult.WITHDRAWN;
        }
        if (raw.contains("부결")) {
            return BillResult.REJECTED;
        }
        if (raw.contains("폐기")) {
            return BillResult.DISCARDED;
        }
        if (raw.contains("가결")) {
            return BillResult.PASSED;
        }
        return BillResult.OTHER;
    }

    /**
     * endpoint 이름과 query parameter를 받아 국회 Open API를 호출하고 JSON을 Map으로 반환한다.
     */
    private Map<String, Object> callApi(String endpoint, Map<String, String> queryParams) {

        StringBuilder uri = new StringBuilder("https://open.assembly.go.kr/portal/openapi/");
        uri.append(endpoint);
        boolean first = true;
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            uri.append(first ? "?" : "&");
            uri.append(entry.getKey()).append("=").append(entry.getValue());
            first = false;
        }

        try {
            String response = webClient.get()
                    .uri(uri.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) {
                return Collections.emptyMap();
            }

            return objectMapper.readValue(response, Map.class);
        } catch (Exception exception) {
            throw new IllegalStateException("국회 Open API 호출 실패: endpoint=" + endpoint, exception);
        }
    }

    /**
     * 목록 API 응답 head 블록에서 전체 건수를 읽는다.
     * 페이지 반복 종료 조건을 계산할 때 사용한다.
     */
    private int extractListTotalCount(Map<String, Object> payload, String endpoint) {
        List<Map<String, Object>> blocks = extractBlocks(payload, endpoint);
        if (blocks.isEmpty()) {
            return 0;
        }

        Map<String, Object> headWrapper = blocks.get(0);
        Object head = headWrapper.get("head");
        if (!(head instanceof List<?> headList) || headList.isEmpty()) {
            return 0;
        }

        Object firstHead = headList.get(0);
        if (!(firstHead instanceof Map<?, ?> firstHeadMap)) {
            return 0;
        }

        Object totalCount = firstHeadMap.get("list_total_count");
        if (totalCount == null) {
            return 0;
        }

        return Integer.parseInt(totalCount.toString());
    }

    /**
     * API 응답에서 실제 row 배열만 꺼낸다.
     * 응답 구조가 맞지 않으면 빈 리스트를 반환한다.
     */
    private List<Map<String, Object>> extractRows(Map<String, Object> payload, String endpoint) {
        List<Map<String, Object>> blocks = extractBlocks(payload, endpoint);
        if (blocks.size() < 2) {
            return Collections.emptyList();
        }

        Map<String, Object> rowWrapper = blocks.get(1);
        Object rows = rowWrapper.get("row");
        if (rows instanceof List<?> rowList) {
            return (List<Map<String, Object>>) rowList;
        }
        return Collections.emptyList();
    }

    /**
     * endpoint 이름 아래의 최상위 블록 리스트를 꺼낸다.
     * endpoint 이름이 다르게 내려오는 경우를 대비해 payload에 키가 하나뿐이면 그 값을 fallback으로 사용한다.
     */
    private List<Map<String, Object>> extractBlocks(Map<String, Object> payload, String endpoint) {
        if (payload == null || payload.isEmpty()) {
            return Collections.emptyList();
        }

        Object block = payload.get(endpoint);
        if (block == null && payload.size() == 1) {
            block = payload.values().iterator().next();
        }

        if (block instanceof List<?> blockList) {
            return (List<Map<String, Object>>) blockList;
        }
        return Collections.emptyList();
    }

    /**
     * 공동발의자 코드/이름처럼 콤마로 이어진 문자열을 리스트로 나눈다.
     */
    private List<String> splitCsv(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return Collections.emptyList();
        }

        List<String> values = new ArrayList<>();
        for (String token : rawValue.split(",")) {
            String trimmed = token.trim();
            if (!trimmed.isBlank()) {
                values.add(trimmed);
            }
        }
        return values;
    }

    /** Map에서 값을 문자열로 안전하게 꺼낸다. */
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /** 여러 후보 중 null/blank가 아닌 첫 값을 고른다. */
    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    /** 새 값이 비어 있지 않을 때만 기존 값을 덮어쓴다. */
    private String pickValue(String candidate, String current) {
        if (candidate == null || candidate.isBlank()) {
            return current;
        }
        return candidate;
    }

    /** 날짜 문자열을 LocalDate로 파싱해 성공했을 때만 기존 값을 갱신한다. */
    private LocalDate pickDate(String candidate, LocalDate current) {
        LocalDate parsed = parseDate(candidate);
        return parsed != null ? parsed : current;
    }

    /** yyyy-MM-dd 형식 날짜 문자열을 LocalDate로 변환한다. 형식이 다르면 null을 반환한다. */
    private LocalDate parseDate(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(rawValue);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    /** 로그에 의안을 읽기 쉽게 출력하기 위한 문자열을 만든다. */
    private String formatBillLabel(String billId, String billNo, String billName) {
        return "[의안번호=" + (billNo != null ? billNo : "-")
                + ", 의안명=" + (billName != null ? billName : "-")
                + ", 의안ID=" + (billId != null ? billId : "-") + "]";
    }
}
