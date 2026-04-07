package com.team3.ourassembly.domain.news.repository;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.news.entity.NewsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<NewsEntity, Long> {
    List<NewsEntity> findByCongressmanOrderByPublishedAtDescIdDesc(CongressmanEntity congressman);

    @Query("""
                select news
                from NewsEntity news
                where news.publishedAt <= :cutoffDate
            """)
    List<NewsEntity> findAllOlderThan(LocalDate cutoffDate);

    boolean existsByUrl(String url);

    @Query("select n.url from NewsEntity n")
    List<String> findAllUrls();
}
