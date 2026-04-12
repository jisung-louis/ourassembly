
-- 2. 1,000명 데이터 생성 쿼리 (MySQL 기준)
INSERT INTO user (email, password, name, address, fcm_token, created_at, updated_at)
WITH RECURSIVE cte (n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM cte WHERE n < 1000
)
SELECT
  CONCAT('test', n, '@example.com'),          -- email (중복 방지)
  '$2a$10$8.UnVuG9HHgffUDAlk8KnO1YfK.f.5K',   -- password (BCrypt 암호화된 '1234' 예시)
  CONCAT('테스터', n),                         -- name
  '서울시 테스트구',                            -- address
  'cXWvIzGljyDyGxerUvYknf:APA91bEIaYiYevhXyFfrnKL9nhoWJCadrEC3eTkp4yTQI2RdwC97OBsToI9VSuaK72ZRzqWFzypBFRCLUkS3qQejL9SBmfGnHpDau1Wc0VZNpIzLNs-bjCg',             -- fcm_token (본인 토큰 넣으세요!)
  NOW(),                                      -- created_at
  NOW()                                       -- updated_at
FROM cte;