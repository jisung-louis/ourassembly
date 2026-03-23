package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.OpinionCreateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/opinion")
public class OpinionController {

    //의견등록
    @PostMapping
    public ResponseEntity<?> createOpinion(@RequestBody OpinionCreateRequestDto requestDto){
        return ResponseEntity.ok(true);
    }




} //class end
