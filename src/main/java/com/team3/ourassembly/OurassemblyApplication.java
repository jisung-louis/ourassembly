package com.team3.ourassembly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class OurassemblyApplication {

	public static void main(String[] args) {
		SpringApplication.run(OurassemblyApplication.class, args);
	}

}
