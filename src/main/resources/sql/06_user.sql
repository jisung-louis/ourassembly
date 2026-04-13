-- 기존 더미 데이터가 있다면 중복 에러 방지를 위해 삭제 후 진행하는 것이 좋습니다.
-- DELETE FROM user WHERE email LIKE 'test%@example.com';

INSERT INTO user (email, password, name, address, fcm_token, created_at, updated_at)
WITH RECURSIVE cte (n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM cte WHERE n < 1000
)
SELECT
  CONCAT('test', n, '@example.com'),
  '$2a$10$8.UnVuG9HHgffUDAlk8KnO1YfK.f.5K',
  CONCAT('테스터', n),
  '서울시 테스트구',
  'ewhmYp62t5xQbS9z0uQhWg:APA91bFPQPEO3bskuhPzKr58PgkGduppnLbUBElOVPjCZKSGk1S2tcAt7HMWblPgAcE6zdSdFc37W3PQ85JNGt5y0EvDGyPBLzXx3AXpPa899QKBoQ11pLk',  -- 모든 유저에 동일한 실제 토큰
  NOW(),
  NOW()
FROM cte;