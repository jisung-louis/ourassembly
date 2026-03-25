-- resources/sql/data.sql
-- 2. 컬럼명을 명시하여 데이터 삽입 (id는 자동생성이므로 제외)
INSERT INTO user (email, password, name, address, created_at, updated_at) VALUES
                                                                              ('user01@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '김민수', '서울', NOW(), NOW()),
                                                                              ('user02@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '이지은', '서울', NOW(), NOW()),
                                                                              ('user03@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '박서준', '부산', NOW(), NOW()),
                                                                              ('user04@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '최유리', '인천', NOW(), NOW()),
                                                                              ('user05@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '정우성', '광주', NOW(), NOW()),
                                                                              ('user06@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '강하늘', '대구', NOW(), NOW()),
                                                                              ('user07@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '한지민', '대전', NOW(), NOW()),
                                                                              ('user08@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '신세경', '울산', NOW(), NOW()),
                                                                              ('user09@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '김수현', '경기', NOW(), NOW()),
                                                                              ('user10@test.com', '$2a$10$69bMrChodVYxOcvM/cUo7evsho3hw6YBJT9yepHudwBlIvi7KlV0.', '이종석', '경기', NOW(), NOW());