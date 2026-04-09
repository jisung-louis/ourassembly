package com.team3.ourassembly.domain.community.point.controller;

import com.team3.ourassembly.domain.community.point.service.PointService;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class PointController {
    private final PointService pointService;
    private final JwtService jwtService;


    //기프티콘 구매
    @PostMapping("/buy")
    public ResponseEntity<?> buyGift(@RequestParam Long productId , @RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtDto.getId();

        BarcodeResponseDto result = pointService.buy(productId , userId);
        if(result==null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(result);
    }
}
