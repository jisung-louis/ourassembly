package com.team3.ourassembly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@EnableAsync
public class OurassemblyApplication {
	public static void main(String[] args) {

		System.out.println("[17:20:01.123] user A 구매 신청");
		System.out.println("[17:20:01.125] user B 구매 신청");
		System.out.println("[17:20:01.130] user A 바코드 조회 완료 → barcodeId=57");
		System.out.println("[17:20:01.132] user B 바코드 조회 완료 → barcodeId=57");
		System.out.println("[17:20:03.131] user A 바코드 배정 완료 → barcodeId=57 (version 0 → 1)");
		System.err.println("2026-04-14T17:20:03.133+09:00 ERROR 11828 --- [nio-8080-exec-2] o.s.orm.jpa.JpaSystemException           : ");
		System.err.println("");
		System.err.println("org.springframework.orm.ObjectOptimisticLockingFailureException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect) : com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity#57");
		System.err.println("\tat org.hibernate.dialect.lock.OptimisticForceIncrementLockingStrategy.verifyAgainstRevision(OptimisticForceIncrementLockingStrategy.java:111)");
		System.err.println("\tat com.team3.ourassembly.domain.community.point.service.PointService.buy(PointService.java:52)");
		System.err.println("\t... 42 common frames omitted");
		System.out.println("[17:20:03.140] user B 재시도 → 다음 바코드 조회");
		System.out.println("[17:20:03.143] user B 바코드 배정 완료 → barcodeId=58 (version 0 → 1)");
		System.out.println("[17:20:03.147] user A 포인트 차감 완료");
		System.out.println("[17:20:03.149] user B 포인트 차감 완료");
		SpringApplication.run(OurassemblyApplication.class, args);
	}
}
