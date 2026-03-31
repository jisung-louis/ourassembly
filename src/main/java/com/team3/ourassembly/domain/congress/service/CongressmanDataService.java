package com.team3.ourassembly.domain.congress.service;

import com.team3.ourassembly.domain.congress.entity.CommitteeEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanCommitteeEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CommitteeRepository;
import com.team3.ourassembly.domain.congress.repository.CongressmanCommitteeRepository;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CongressmanDataService {
    private final CongressmanRepository congressmanRepository;
    private final CommitteeRepository committeeRepository;
    private final CongressmanCommitteeRepository congressmanCommitteeRepository;

    private final WebClient webClient = WebClient.builder().build();

    @Value("${assembly.open-api.key}") // application.properties에 assembly.open-api.key={실제키값}을 넣어야 함
    String key;

    // 국회의원 종합 API 호출해서 특정 대수 가져옴
    public List<Map<String, Object>> getCongressmenRawInfo(Integer termNumber){


        List<Map<String, Object>> allMembers = new ArrayList<>();

        for (int i = 1; i <= 17; i++) {
            System.out.println(i + " 번째 반복 중");
            String uri = "https://open.assembly.go.kr/portal/openapi/ALLNAMEMBER?Type=json";
            uri += "&Key=" + key;
            uri += "&pIndex=" + i;
            uri += "&pSize=200";

            String response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> block = mapper.readValue(response, Map.class);

            List<Map<String, Object>> outer = (List<Map<String, Object>>) block.get("ALLNAMEMBER");

            if (outer != null && outer.size() > 1) {
                Map<String, Object> rowWrapper = outer.get(1);
                List<Map<String, Object>> rows = (List<Map<String, Object>>) rowWrapper.get("row");

                if (rows != null) {
                    for (Map<String, Object> member : rows) {
                        String era = (String) member.get("GTELT_ERACO");

                        if (era != null && era.contains("제" + termNumber + "대")) {
                            allMembers.add(member);
                        }
                    }
                }
            }
        }

        return allMembers;
    }

    public List<CongressmanEntity> saveCongressmen(Integer termNumber){
        List<Map<String, Object>> congressmen = getCongressmenRawInfo(termNumber);
        List<CongressmanEntity> congressmenList = new ArrayList<>();
        int count = 0;
        for (Map<String, Object> congress : congressmen) {
            count++;
            System.out.println("[LOG] " + count + "번째 작업");
            String name = getString(congress, "NAAS_NM");
            String rawPartyName = getString(congress,"PLPT_NM");
            int partyIdx = rawPartyName != null ? rawPartyName.lastIndexOf("/") : -1; // '/'로 나눠진 정당이름 중
            String party = (partyIdx == -1) ? rawPartyName : rawPartyName.substring(partyIdx + 1); // 가장 마지막 정당 반환
            String photoUrl = getString(congress,"NAAS_PIC");
            String email = getString(congress,"NAAS_EMAIL_ADDR");
            String career = getString(congress,"BRF_HST");
            String numberOfReElection = getString(congress,"RLCT_DIV_NM");
            String tel = getString(congress,"NAAS_TEL_NO");
            String address = getString(congress,"OFFM_RNUM_NO");
            String rawWard = getString(congress,"ELECD_NM");
            int wardIdx = rawWard != null ? rawWard.lastIndexOf("/") : -1;
            String ward = (wardIdx == -1) ? rawWard : rawWard.substring(wardIdx + 1);

            CongressmanEntity congressman = CongressmanEntity
                    .builder()
                    .name(name)
                    .party(party)
                    .photoUrl(photoUrl)
                    .email(email)
                    .career(career)
                    .numberOfReElection(numberOfReElection)
                    .tel(tel)
                    .address(address)
                    .ward(ward)
                    .build();

            CongressmanEntity savedCongressman = congressmanRepository.save(congressman);
            congressmenList.add(savedCongressman);
            System.out.println("[LOG] [" + name + "] 국회의원 저장 완료");


            // 국회의원의 위원회(committee)를 저장하기
            // 해당 국회의원의 committee가 committee에 존재하지 않는다면 새로 추가하고
            // congressman_committee 테이블에 해당 매핑 데이터 (congressman, committee) 삽입

            String committeeNames = getString(congress, "BLNG_CMIT_NM"); // "예산결산특별위원회, 기후에너지환경노동위원회"
            if(committeeNames != null){
                List<String> committeeNameList =
                        Arrays.stream(committeeNames.split(",")) // ','으로 나눔
                                .map(String::trim) // 나눈 각 위원회명 문자열의 공백 제거
                                .toList(); // 리스트화

                // 먼저 DB에 저장된 committee 리스트를 map에 가져옴 (나중에 추가될 땐 여기에도 추가해야 함)
                List<CommitteeEntity> committeeEntities = committeeRepository.findAllByNameIn(committeeNameList);
                Map<String, CommitteeEntity> map = new HashMap<>(); // key: 위원회명, value: 위원회엔티티
                committeeEntities.forEach( committeeEntity -> map.put(committeeEntity.getName(), committeeEntity));

                // [1] 위원회를 하나씩 골라서, 현재 committee에 존재하는지 확인
                committeeNameList.forEach(committeeName ->{
                    if(!map.containsKey(committeeName)){
                        CommitteeEntity newCommittee = CommitteeEntity.builder().name(committeeName).build();
                        CommitteeEntity savedCommittee = committeeRepository.save(newCommittee);
                        map.put(savedCommittee.getName(), savedCommittee);
                        System.out.println("[LOG] [" + savedCommittee.getName() + "] 위원회 새로 생성 완료");
                    }
                    CongressmanCommitteeEntity congressmanCommitteeEntity =
                            CongressmanCommitteeEntity
                                    .builder()
                                    .committee(map.get(committeeName))
                                    .congressman(savedCongressman)
                                    .build();
                    CongressmanCommitteeEntity save = congressmanCommitteeRepository.save(congressmanCommitteeEntity);
                    if(save.getId() >= 0){
                        System.out.println("[LOG] [" + save.getCongressman().getName() + "] 국회의원의 소속위원회인 " + save.getCommittee().getName() + " 매핑 완료");
                    }
                });
            }
        }
        return congressmenList;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }


}
