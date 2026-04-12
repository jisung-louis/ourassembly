-- 기존 더미 데이터가 있다면 중복 에러 방지를 위해 삭제 후 진행하는 것이 좋습니다.
-- DELETE FROM user WHERE email LIKE 'test%@example.com';

INSERT INTO user (email, password, name, address, fcm_token, created_at, updated_at)
WITH RECURSIVE cte (n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM cte WHERE n < 1000
)
SELECT
  CONCAT('test', n, '@example.com'),          -- email (test1@..., test2@...)
  '$2a$10$8.UnVuG9HHgffUDAlk8KnO1YfK.f.5K',   -- password
  CONCAT('테스터', n),                         -- name
  '서울시 테스트구',                            -- address
  -- 💡 토큰 뒤에 숫자(n)를 붙여서 모두 고유한 값으로 만듭니다.
  CONCAT('cXWvIzGljyDyGxerUvYknf:APA91bEI...-bjCg_', n),
  NOW(),
  NOW()
FROM cte;