package com.team3.ourassembly.domain.congress.service;

import com.team3.ourassembly.domain.congress.dto.CongressmanDetailResponse;
import com.team3.ourassembly.domain.congress.dto.CongressmanSummaryResponse;
import com.team3.ourassembly.domain.congress.entity.CongressmanCommitteeEntity;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanCommitteeRepository;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CongressmanService {
    private final CongressmanRepository congressmanRepository;
    private final CongressmanCommitteeRepository congressmanCommitteeRepository;

    public CongressmanDetailResponse getCongressmanDetail(Long congressmanId){
        CongressmanEntity congressmanEntity = congressmanRepository.findById(congressmanId)
                .orElseThrow(() -> new IllegalArgumentException(congressmanId + "번 국회의원을 찾을 수 없습니다."));

        CongressmanDetailResponse dto = congressmanEntity.toDto();

        // 생일 -> 나이 변환해서 dto에 set
        String birthday = congressmanEntity.getBirthday(); // yyyy-mm-dd
        String age = null;
        if(birthday != null){
            String[] split = birthday.split("-");
            int year = Integer.parseInt(split[0]);
            int yearNow = LocalDate.now().getYear();
            int ageInt = yearNow - year;
            age = Integer.toString(ageInt);
        }
        dto.setAge(age);

        List<String> committee = new ArrayList<>();

        List<CongressmanCommitteeEntity> committeeMapped = congressmanCommitteeRepository.findByCongressman(congressmanEntity);
        committeeMapped.forEach(c ->{
            committee.add(c.getCommittee().getName());
        });
        dto.setCommittee(committee);

        return dto;
    }

    public List<CongressmanSummaryResponse> getCongressmenByName(String name){
        String normalizedName = name == null ? "" : name.trim();

        if (normalizedName.isEmpty()) {
            return List.of();
        }

        List<CongressmanEntity> congressmanEntity =
                congressmanRepository.findByNameContainingIgnoreCaseOrderByNameAsc(normalizedName);
        List<CongressmanSummaryResponse> congressmanSummaryResponseList = new ArrayList<>();
        congressmanEntity.forEach(congressman -> {
            CongressmanSummaryResponse summaryDto = congressman.toSummaryDto();
            congressmanSummaryResponseList.add(summaryDto);
        });
        return congressmanSummaryResponseList;
    }

    // 회원가입했을 때 해당 유저가 국회의원이라면(국회의원 이메일과 같은 이메일로 회원가입했다면) congressman 레코드의 user_id 칼럼에 대입
    public boolean setUserToCongressman(UserEntity user){
        Optional<CongressmanEntity> congressman = congressmanRepository.findByEmail(user.getEmail());
        congressman.ifPresent(congressmanEntity -> congressmanEntity.setUser(user));
        return congressman.isPresent();
    }
}
