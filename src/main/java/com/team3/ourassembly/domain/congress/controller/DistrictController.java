package com.team3.ourassembly.domain.congress.controller;

import com.team3.ourassembly.domain.congress.service.DistrictService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("district")
@CrossOrigin(origins = "http://localhost:5173")
public class DistrictController {
    private final DistrictService districtService;

    @PutMapping
    public ResponseEntity<?> updateCongressmanOfDistrictAll(@RequestBody Map<String, Map<String, List<String>>> sggAll){
        Map<String, Integer> failedMap = districtService.updateCongressmanOfDistrictAll(sggAll);
        return ResponseEntity.ok(failedMap);
    }

    @GetMapping
    public ResponseEntity<?> getDistricts(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(districtService.getDistricts());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDistricts(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "10") Integer limit
    ) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(districtService.searchDistricts(query, limit));
    }

    @GetMapping("/{address1}")
    public ResponseEntity<?> getDistrictsByAddress1(@PathVariable String address1) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(districtService.getDistrictsByAddress1(address1));
    }
}
