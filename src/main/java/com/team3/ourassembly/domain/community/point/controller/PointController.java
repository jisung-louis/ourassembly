package com.team3.ourassembly.domain.community.point.controller;

import com.team3.ourassembly.domain.community.point.service.PointService;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.global.aop.Token;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/buy")
public class PointController {
    private final PointService pointService;
    private final JwtService jwtService;


    //기프티콘 구매
    @PostMapping
    @Token
    public ResponseEntity<?> buyGift(@RequestParam Long productId , HttpServletRequest request){

        Long userId = (Long)request.getAttribute("userId");
        BarcodeResponseDto result = pointService.buy(productId , userId);
        if(result==null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(result);
    }
}
