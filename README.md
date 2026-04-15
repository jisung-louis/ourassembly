# `우리동네 국회의원`

- 내 지역구 국회의원과 소통하고 건의하는 국민 정치 참여 플랫폼
- 높아지는 정치 관심도에 비해, 일반 국민들의 정치 참여 방식은 국회-국민간 소통 창구 부재로 한계가 있다. (국회-국민간 소통 수준은 4점 만점에 2점 수준으로 최하위)
- 기존의 수동적인 정치 참여가 아닌, 국회의원과의 소통과 건의를 통해 능동적으로 헌법적 권리인 참정권을 고취할 수 있는 플랫폼을 목표로 한다.

## 팀원과 역할

- 전지성 (팀장)
  - 국회의원 상세 CRUD 구현
  - 국회의원별 발의안/관련 뉴스 데이터 수집 시스템 구축
  - 국민 의견 클러스터링 시스템 구축
  - AWS 배포
- 김용성
  - 국회의원 팔로우 시스템
  - 푸시 알림(FCM) 기능 구현
  - 국민 의견 CRUD 구현
- 유환빈
  - 회원가입/로그인
  - 지역 주민 커뮤니티 시스템
  - 관리자/마이페이지 구현

## 기술 스택

Backend : Spring Boot, Java, JPA, Spring AI, Smile, Jsoup,
Auth : JWT, Gmail SMTP
DB : MySQL
Data : 대한민국 국회 공공데이터, 네이버 뉴스검색
AI Model : OpenAI text-embedding-3-small, OpenAI gpt-4.1-nano
Frontend : React, Vite, Axios
Infra : AWS EC2, AWS S3
Cowork : GitHub, JIRA

## 주요 기능

### 서비스 아키텍처

(이미지)

## 시연영상 링크

(동영상)

## 참고 링크

- API 명세서 : 
- 디자인 (Figma) : 
- ppt 및 canva Link :
