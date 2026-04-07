package com.team3.ourassembly.domain.news.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.news.dto.NewsResponse;
import com.team3.ourassembly.domain.news.service.NewsCompanyMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jsoup.Jsoup;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
@Table(name = "news", uniqueConstraints = { @UniqueConstraint(columnNames = {"url", "congressman_id"}) })
public class NewsEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    @Column
    private String source;

    @Column(nullable = false)
    private LocalDate publishedAt;

    @ManyToOne
    @JoinColumn(name = "congressman_id", nullable = false)
    private CongressmanEntity congressman;

    public NewsResponse toDto(){
        return NewsResponse.builder()
                .id(id)
                .title(cleanText(title))
                .url(url)
                .source(source)
                .company(NewsCompanyMapper.resolve(url))
                .publishedAt(publishedAt)
                .build();
    }

    public static String extractSource(String url) {
        if (url == null || url.isBlank()) {
            return "출처 미상";
        }

        try {
            String host = new URI(url).getHost();
            if (host == null || host.isBlank()) {
                return "출처 미상";
            }

            return host.replaceFirst("^www\\.", "");
        } catch (URISyntaxException exception) {
            return "출처 미상";
        }
    }

    public static String cleanText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }

        return Jsoup.parse(rawText).text().trim(); // HTML 태그 제거 및 HTML 엔티티 복원
    }
}
