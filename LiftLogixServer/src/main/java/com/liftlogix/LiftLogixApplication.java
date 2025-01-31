package com.liftlogix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@Cacheable
@EnableScheduling
public class LiftLogixApplication {

	public static void main(String[] args) {
		SpringApplication.run(LiftLogixApplication.class, args);
	}

}
