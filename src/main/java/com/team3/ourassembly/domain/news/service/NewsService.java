package com.team3.ourassembly.domain.news.service;

import com.team3.ourassembly.domain.alarm.repository.FollowRepository;
import com.team3.ourassembly.domain.alarm.service.NotificationService;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.news.dto.NewsResponse;
import com.team3.ourassembly.domain.news.entity.NewsEntity;
import com.team3.ourassembly.domain.news.repository.NewsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
public class NewsService {
    private final NewsRepository newsRepository;
    private final CongressmanRepository congressmanRepository;
    private final FollowRepository followRepository;
    private final NotificationService notificationService;

    private final WebClient webClient = WebClient.builder().build();

    @Value("${naver.client.id}")
    private String naverClientId;
    @Value("${naver.client.secret}")
    private String naverClientSecret;

    // [1] 네이버 뉴스에서 오전 7시, 저녁 7시마다 국회의원별 뉴스 크롤링
    @Scheduled(cron = "0 0 7,19 * * *")
    public void scheduleCrawlCongressmanNews(){
        crawlCongressmanNews();
    }

    public List<Map<String, Integer>> crawlCongressmanNews(){
        List<CongressmanEntity> congressmen = congressmanRepository.findAll();
        // [1] 30일 지난 뉴스 모두 지움
        LocalDate cutoff = LocalDate.now().minusDays(30);
        List<NewsEntity> oldNews = newsRepository.findAllOlderThan(cutoff);
        newsRepository.deleteAll(oldNews);
        System.out.println("제거된 오래된 뉴스 개수 = " + oldNews.size());

        Map<String, Integer> lessMap = new HashMap<>();
        List<Map<String, Integer>> savedCountList = new ArrayList<>();

        // [2] 국회의원마다 관련뉴스 저장
        congressmen.forEach(congressman -> {
                System.out.println();
                System.out.println("[LOG]" + congressman.getName() + " 의원 뉴스 수집 시작");
            List<NewsEntity> list = new ArrayList<>();
            Set<String> seenUrls = new HashSet<>(); // 페이지 별 중복 url 거르기 위한 임시 저장소
            for(int i = 1; list.size() <= 5 && i <= 3; i++){
                List<NewsEntity> newsEntities = getNewsEntities(congressman, i, seenUrls);
                list.addAll(newsEntities);
            }
            List<NewsEntity> newsEntities = newsRepository.saveAll(list);
            notificationService.sendNewsNotifyToFollowers(congressman, newsEntities);
            int savedSize = newsEntities.size();
            String congressmanName = congressman.getName();
            System.out.println("[LOG]" + congressmanName + " 의원의 관련 뉴스 총 " + savedSize + " 개 저장 완료");
            savedCountList.add(Map.of(congressmanName, savedSize));

            // TEMP
            if(savedSize <= 5){ lessMap.put(congressmanName, savedSize);}
        });
        
        System.out.println();
        System.out.println("뉴스가 5개 이하인 의원 목록 : " + lessMap.keySet());
        lessMap.forEach((cName, size) -> {
            System.out.println(cName + " : " + size + "개");
        });

        return savedCountList;
    }

    private @NonNull List<NewsEntity> getNewsEntities(CongressmanEntity congressman, int page, Set<String> seenUrls) {
        List<Map<String,String>> news = (List<Map<String, String>>) crawlCongressmanNewsByCongressman(congressman,page).get("items");
        List<Map<String, String>> filteredNews = filterCongressmanNews(news, congressman);
        return filteredNews.stream()
                .filter(n -> {
                    String url = n.get("originallink");
                    return url != null && seenUrls.add(url); // 페이지 별 중복 url 거르기 위한 임시 저장소에 저장하고, 저장이 실패
                })
                .map(n -> NewsEntity.builder()
                    .title(NewsEntity.cleanText(n.get("title"))) // HTML 태그 제거
                    .url(n.get("originallink"))
                    .source(NewsEntity.extractSource(n.get("originallink")))
                    .publishedAt(toLocalDate(n.get("pubDate")))
                    .congressman(congressman)
                    .build()
        ).toList();
    }

    private Map<String,Object> crawlCongressmanNewsByCongressman(CongressmanEntity congressman, int page){
        String url = "https://openapi.naver.com/v1/search/news.json";
        String query = congressman.getName() + "+의원"; // 의원명 기반 네이버 뉴스 검색

        url += "?query=" + query; // 검색어
        url += "&display=100"; // 한 페이지당 뉴스 개수
        url += "&start=" + page; // 페이지
        url += "&sort=sim"; // 정렬 (관련도 : sim, 최신순 : date)
        return webClient.get()
                .uri(url)
                .headers(httpHeaders -> {
                    httpHeaders.add("X-Naver-Client-Id", naverClientId);
                    httpHeaders.add("X-Naver-Client-Secret", naverClientSecret);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private List<Map<String,String>> filterCongressmanNews(List<Map<String,String>> news, CongressmanEntity congressman){
        String cName = congressman.getName();
        String cParty = congressman.getParty();
        String cWard = congressman.getWard();

        List<String> keyword = Stream.of("의원", "국회", cParty, cWard)
                .filter(Objects::nonNull).toList();

        return news.stream()
                .filter(n -> {
                    String title = NewsEntity.cleanText(n.getOrDefault("title","")); // HTML 태그 제거
                    String description = NewsEntity.cleanText(n.getOrDefault("description","")); // HTML 태그 제거
                    if(title.isEmpty() || description.isEmpty()) { return false; }

                    boolean isContainingCongressmanName = title.contains(cName);
                    boolean isContainingKeywordInTitleOrDescription =
                            keyword.stream().anyMatch(title::contains) || keyword.stream().anyMatch(description::contains);

                    boolean isContainingCongressmanNameInTitleAndKeywordInTitleOrDescription =
                            isContainingCongressmanName && isContainingKeywordInTitleOrDescription;
                    boolean isContaining2OrMoreCongressmanName = false;
                    int index = description.indexOf(cName);
                    if (index != -1) {
                        String description2 = description.substring(index + cName.length());
                        isContaining2OrMoreCongressmanName = description2.contains(cName);
                    }

                    // '의원명'이 기사 제목에 있고, 제목 또는 본문에 '국회','의원','정당명', '지역구명'이 하나 이상 있을경우
                    // 또는
                    // 본문 요약에 '의원명'이 2개 이상 있을 경우
                    return isContainingCongressmanNameInTitleAndKeywordInTitleOrDescription || isContaining2OrMoreCongressmanName;
                })
                .filter(n -> {
                    String rawPublishedAt = n.getOrDefault("pubDate","");
                    if (rawPublishedAt.isEmpty()) { return false; }
                    LocalDate publishedAt = toLocalDate(rawPublishedAt);
                    LocalDate today = LocalDate.now();
                    // 30일 이내 뉴스만 남김
                    return !publishedAt.isBefore(today.minusDays(30));
                })
                .filter(n-> !newsRepository.existsByUrl(n.get("originallink"))) // 같은 url 가진 뉴스 (중복) 제거
                .toList();
    }

    private LocalDate toLocalDate(String rfcFormat){
        return ZonedDateTime.parse(rfcFormat, DateTimeFormatter.RFC_1123_DATE_TIME).toLocalDate();
    }

    // [2] 특정 국회의원의 뉴스 find해서 꺼내줌
    public List<NewsResponse> findNewsByCongressmanId(String congressmanId){
        CongressmanEntity congressman = congressmanRepository.findById(congressmanId).orElseThrow();
        List<NewsEntity> newsList = newsRepository.findByCongressmanOrderByPublishedAtDescIdDesc(congressman);
        return newsList.stream().map(NewsEntity::toDto).toList();
    }


    // TEMP
    public Map<String, Object> findComInUrl(){
        List<String> hosts = newsRepository.findAllUrls().stream()
                .filter(url -> url != null && !url.isEmpty())
                .map(url -> {
                    return url.replaceFirst("http://", "").replaceFirst("https://","") // "https://", "http://" 제거
                            .split("/",2)[0]; // "/" 로 url을 나눔(host와 path 분리) host 부분만 추출 ( ex : "www.kbs.co.kr", "biz.heraldcorp.com", ...)
                }).toList();
        Set<String> unique = new HashSet<>();
        Map<String, Integer> duplicates = new HashMap<>();

        for (String host : hosts) {
            if (!unique.add(host)) {
                duplicates.put(host, duplicates.getOrDefault(host, 0) + 1);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", unique.size());
        response.put("hosts", unique);
        Map<String, Integer> sortedDuplicates = duplicates.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // value 기준 내림차순
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new // 순서 유지
                ));

        response.put("dupCount", sortedDuplicates);

        return response;
    }
}
