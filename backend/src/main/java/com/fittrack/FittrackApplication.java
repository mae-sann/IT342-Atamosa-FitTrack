package com.fittrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.fittrack"})
public class FittrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(FittrackApplication.class, args);
        System.out.println("=== FitTrack Backend Started ===");
    }
}