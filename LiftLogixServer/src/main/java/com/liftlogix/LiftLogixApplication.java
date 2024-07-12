package com.liftlogix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.Cacheable;

@SpringBootApplication
@Cacheable
public class LiftLogixApplication {

	public static void main(String[] args) {
		SpringApplication.run(LiftLogixApplication.class, args);
	}

}
