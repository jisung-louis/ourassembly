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
  'cLxWeCHqrue1sSYFiQzjAK:APA91bFTC22r1eScSQdUvT01V52YLnpihJ3NyDeBfy-5_TKBgPNDKBV04m1NdkIYWWpJvbQZUkrhj5o_k7fkTcy-JYP0m01d_pH43dZscPmhdqSN7uo5tY0',  -- 모든 유저에 동일한 실제 토큰
  NOW(),
  NOW()
FROM cte;