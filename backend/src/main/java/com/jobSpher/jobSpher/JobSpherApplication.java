package com.jobSpher.jobSpher;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
@EnableAsync
public class JobSpherApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobSpherApplication.class, args);
	}

	@Bean
	CommandLineRunner init() {
		return args -> {
			Files.createDirectories(Paths.get("uploads/resumes"));
			Files.createDirectories(Paths.get("uploads/payments"));
			Files.createDirectories(Paths.get("uploads/logos"));
		};
	}
}
