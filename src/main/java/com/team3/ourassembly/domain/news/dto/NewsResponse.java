package com.team3.ourassembly.domain.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class NewsResponse {
    private Long id;
    private String title;
    private String url;
    private String source;
    private String company;
    private LocalDate publishedAt;
}
