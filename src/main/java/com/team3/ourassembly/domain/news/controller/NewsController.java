package com.team3.ourassembly.domain.news.controller;

import com.team3.ourassembly.domain.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/news")
public class NewsController {
    private final NewsService newsService;

    // [1] 국회의원별 관련 뉴스 크롤링 후 저장(강제 발동)
    @PostMapping("/sync")
    public ResponseEntity<?> syncNews() {
        return ResponseEntity.ok(newsService.crawlCongressmanNews());
    }

    // [2] 국회의원별 뉴스 보여줌
    @GetMapping("/{congressmanId}")
    public ResponseEntity<?> getCongressmanNews(@PathVariable String congressmanId){
        return ResponseEntity.ok(newsService.findNewsByCongressmanId(congressmanId));
    }

    // TEMP
    @GetMapping("/com")
    public ResponseEntity<?> getCompanyInUrl() {
        return ResponseEntity.ok(newsService.findComInUrl());
    }
}
