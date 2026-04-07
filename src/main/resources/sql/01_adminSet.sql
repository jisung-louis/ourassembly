SET FOREIGN_KEY_CHECKS = 0;
delete from ourassembly.user where email = 'admin@gmail.com';
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO ourassembly.user (id, created_at, updated_at, address, email, name, password) VALUES (1, '2026-04-01 00:00:00.000000', '2026-04-01 00:00:00.000000', null, 'admin@gmail.com', '관리자', '$2a$10$J2V9dUkkHbRWl1IWk8NAFuYd8aoYd3hs4FVUWyuD02.t8WSu9pyva');

-- 아래 쿼리는 개발시에만 사용 --
SET FOREIGN_KEY_CHECKS = 0;
delete from ourassembly.user where email = 'congress@gmail.com';
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO ourassembly.user (id, created_at, updated_at, address, email, name, password) VALUES (2, '2026-04-01 00:00:00.000000', '2026-04-01 00:00:00.000000', null, 'congress@gmail.com', '테스트국회의원계정', '$2a$10$TyisN7dO98kCPFe.Vr2HKumGP2hwWJyUrEFiLyOpPx5wfGjpI5Uji');

-- 관리자 테스트용 --
SET FOREIGN_KEY_CHECKS = 0;
delete from ourassembly.user where email = 'manager@gmail.com';
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO ourassembly.user (id, created_at, updated_at, address, email, name, password) VALUES (3, '2026-04-01 00:00:00.000000', '2026-04-01 00:00:00.000000', null, 'manager@gmail.com', '테스트관리자계정', '$2b$10$bj/.D2wiE8AK419l8sVSuu/Z8nmto80EQ3pj84IDzo2xAK.XW9FsS');
