package com.orby.orby;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.orby.orby")
@EnableJpaRepositories(basePackages = "com.orby.orby")
@EntityScan(basePackages = "com.orby.orby")
public class OrbyApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrbyApplication.class, args);
	}

}
