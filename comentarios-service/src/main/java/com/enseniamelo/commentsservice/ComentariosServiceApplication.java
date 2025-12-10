package com.enseniamelo.commentsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ComentariosServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComentariosServiceApplication.class, args);
    }
}
