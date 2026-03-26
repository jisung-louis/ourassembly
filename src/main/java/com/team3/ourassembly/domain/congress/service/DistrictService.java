package com.team3.ourassembly.domain.congress.service;

import com.team3.ourassembly.domain.congress.dto.DistrictResponse;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.entity.DistrictEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.congress.repository.DistrictRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DistrictService {
    private final DistrictRepository districtRepository;
    private final CongressmanRepository congressmanRepository;

    private List<String> processList = new ArrayList<>();

    private String normalize(String s) {
        if (s == null) return "";

        return s
                .replaceAll("제(?=\\d)", "")  // 숫자 앞의 "제"만 제거
                .replace("-", "")
                .replace("·", "")
            .trim();
    }

    // TODO : district의 모든 레코드마다 congressman_id를 채워 넣어야 함 (update)
    public Map<String, Integer> updateCongressmanOfDistrictAll(Map<String, Map<String, List<String>>> sggAll){
        List<String> address1s =
                List.of("서울","부산","대구","인천","광주","대전","울산","세종","경기","강원","충남","충북","전남","전북","경북","경남","제주");
        Map<String, Integer> addressAndFailed = new HashMap<>();

        address1s.forEach(address1 -> {
            int failedCount = updateCongressmanOfDistrict(sggAll, address1);
            addressAndFailed.put(address1, failedCount);
        });
        System.out.println("processList = " + processList);
        return addressAndFailed;
    }

    private int updateCongressmanOfDistrict(Map<String, Map<String, List<String>>> sggAll, String address1) {
            System.out.println( );
            System.out.println("======== [" + address1 + "] 시작 ========");
        List<DistrictEntity> districtSeoul = districtRepository.findByAddress1(address1);
        Map<String, List<String>> districtList = sggAll.get(address1);

        List<DistrictEntity> allDistricts = districtRepository.findAll();

        List<String> processed = new ArrayList<>(); // 이미 처리된 address2(시군구)

        Map<String, List<DistrictEntity>> districtMap =
            allDistricts.stream()
                .collect(java.util.stream.Collectors.groupingBy(DistrictEntity::getAddress2));

        Map<String, CongressmanEntity> congressmanMap =
            congressmanRepository.findAll().stream()
                    .filter(c -> c.getWard() != null && !c.getWard().contains("비례대표"))
                    .collect(java.util.stream.Collectors.toMap(
                        c -> c.getWard(),
                            c -> c,
                            (existing, replacement) -> existing // 중복 방지
                    ));

        for(DistrictEntity district : districtSeoul){ // DB의 district 레코드마다 반복
            // System.out.println();
            // System.out.println("[반복1 - district 레코드] " + district.getAddress3());
            String address3 = district.getAddress3(); // 읍/면/동
            System.out.println("processed = " + processed);

            // 만약 이미 '일원'으로 채워진 district 테이블 레코드 동이면 continue
            if(district.getCongressman() != null){
                // System.out.println("일원이라 패스!");
                continue;
            }

            for(Map.Entry<String, List<String>> entry : districtList.entrySet()) { // 선거구마다 반복
                String sgg = entry.getKey();
                List<String> dongs = entry.getValue();
                // System.out.println("  [반복2 - 선거구] :  " + sgg);
                // System.out.println("  [반복2 - 선거구] " + dongs);
                if(district.getAddress2().equals("연천군")){
                    System.out.println("우앙! 연천군 차례인데 " + sgg + " 이당!");
                }

                for (String dong : dongs) { // 동마다 반복
                    // System.out.println("    [반복3 - 동] : " + dong);

                    // 만약 '?? 일원' 일 경우
                    List<String> split = List.of(dong.split("-"));
                    // 마지막 요소가 '일원'이면
                    int size = split.size();
                    boolean ilwon = split.get(size - 1).equals("일원");
                    String address2 = (split.size() > 1) && (ilwon) ? split.get(size - 2) : split.get(0);
//                    if(split.size() > 1) {
//                        System.out.println("address2 = " + address2);
//                    }
                    boolean isNotProcessed = !processed.contains(address2);

                    if(district.getAddress2().equals("연천군")){
                        System.out.println("연천군이다!!!!!!!! 지금 보는 동은 " + dong + " 이다!");
                    }

                    if(ilwon && isNotProcessed){

                        List<DistrictEntity> districts = districtMap.get(address2);
                        if (districts != null) {
                            CongressmanEntity congressman =
                                    address1.equals("세종") ? congressmanMap.get(sgg) : congressmanMap.get(address1 + " " + sgg);
                            for (DistrictEntity districtEntity : districts) {
                                if (congressman != null) {
                                    districtEntity.setCongressman(congressman);
                                }
                            }
                            processed.add(address2);
                            System.out.println("[중요!!] 리스트에 추가된 processed = " + address2);
                            if (congressman != null) {
                                // System.out.println("[" + dong + "]의 선거구는 [" + sgg + "]이고, [" + congressman.getName() + "] 국회의원이 담당합니다.");
                            }
                        }
                        break;
                    }

                    boolean isSameDong =
                        normalize(dong).equals(normalize(address3));

                    if (isSameDong) {
                        CongressmanEntity congressman =
                                address1.equals("세종") ? congressmanMap.get(sgg) : congressmanMap.get(address1 + " " + sgg);
                        if(congressman == null) {
                            // System.out.println("[WARNING]" + address1 + " " + sgg + " 지역구의 국회의원을 찾을 수 없습니다.");
                            break;
                        }
                        district.setCongressman(congressman);
                        // System.out.println("[" + dong + "]의 선거구는 [" + sgg + "]이고, [" + congressman.getName() + "] 국회의원이 담당합니다.");
                        break;
                    }
                }
            }
        }

        processList.addAll(processed);
        List<DistrictEntity> failed = districtRepository.findByAddress1AndCongressmanIsNull(address1);
        return failed.size();
    }

    public List<DistrictResponse> getDistricts(){
        List<DistrictEntity> all = districtRepository.findAll();
        List<DistrictResponse> list = new ArrayList<>();
        all.forEach(district -> {
            DistrictResponse dto = district.toDto();
            CongressmanEntity congressman = district.getCongressman();
            if(congressman != null){
                dto.setCongressmanId(congressman.getId());
                dto.setCongressmanName(congressman.getName());
                dto.setCongressmanPhotoUrl(congressman.getPhotoUrl());
                dto.setCongressmanParty(congressman.getParty());
                dto.setCongressmanWard(congressman.getWard());
            }
            list.add(dto);
        });
        return list;
    }

    public List<DistrictResponse> getDistrictsByAddress1(String address1){
        List<DistrictEntity> all = districtRepository.findByAddress1(address1);
        List<DistrictResponse> list = new ArrayList<>();
        all.forEach(district -> {
            DistrictResponse dto = district.toDto();
            CongressmanEntity congressman = district.getCongressman();
            if(congressman != null){
                dto.setCongressmanId(congressman.getId());
                dto.setCongressmanName(congressman.getName());
                dto.setCongressmanPhotoUrl(congressman.getPhotoUrl());
                dto.setCongressmanParty(congressman.getParty());
                dto.setCongressmanWard(congressman.getWard());
            }
            list.add(dto);
        });
        return list;
    }
}
