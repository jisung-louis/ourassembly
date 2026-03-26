package com.team3.ourassembly.domain.congress.service;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class CongressmanDataService {
    private final CongressmanRepository congressmanRepository;

    private final WebClient webClient = WebClient.builder().build();

    @Value("${assembly.open-api.key}") // application.properties에 assembly.open-api.key={실제키값}을 넣어야 함
    String key;

    // 국회의원 종합 API 호출해서 특정 대수 가져옴
    public List<Map<String, Object>> getCongressmenRawInfo(Integer termNumber){


        List<Map<String, Object>> allMembers = new ArrayList<>();

        for (int i = 1; i <= 33; i++) {
            System.out.println(i + " 번째 반복 중");
            String uri = "https://open.assembly.go.kr/portal/openapi/ALLNAMEMBER?Type=json";
            uri += "&Key=" + key;
            uri += "&pIndex=" + i;
            uri += "&pSize=100";

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

            CongressmanEntity save = congressmanRepository.save(congressman);
            congressmenList.add(save);
            System.out.println("[LOG] [" + name + "] 국회의원 저장 완료");
        }
        return congressmenList;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }


}
