package com.team3.ourassembly.domain.congress.controller;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.service.CongressmanDataService;
import com.team3.ourassembly.domain.congress.service.CongressmanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/congress")
public class CongressmanController {
    private final CongressmanDataService congressmanDataService;
    private final CongressmanService congressmanService;

    private final int currentTermNumber = 22;

    // ==== 국회 Open API 사용하는 Controller ====
    @GetMapping("/raw")
    public ResponseEntity<?> getCongressmenRawInfo(@RequestParam(defaultValue = "22") Integer termNumber){
        // [1] 유효성검사
        if (termNumber < 1 || termNumber > currentTermNumber){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("1과 " + currentTermNumber + " 사이의 값을 입력해야 합니다.");
        }
        // [2] service 호출
        List<Map<String, Object>> congressmen = congressmanDataService.getCongressmenRawInfo(termNumber);
        System.out.println("제 " + currentTermNumber + "대 국회의원 데이터 가져오기 완료 : " + congressmen.size() + " 명의 국회의원 데이터를 가져왔습니다.");
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(congressmen);
    }

    @PostMapping("/save")
    public ResponseEntity<?> getCongressmenInfo(@RequestParam(defaultValue = "22") Integer termNumber){
        List<CongressmanEntity> savedCongressmen = congressmanDataService.saveCongressmen(termNumber);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCongressmen);
    }

    // ==== 국회 Open API 사용하는 Controller 끝 ====

    @GetMapping("/detail/{congressmanId}")
    public ResponseEntity<?> getCongressmanDetail(@PathVariable Long congressmanId){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(congressmanService.getCongressmanDetail(congressmanId));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getCongressmanByName(@RequestParam String name) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(congressmanService.getCongressmenByName(name));

    }
}
