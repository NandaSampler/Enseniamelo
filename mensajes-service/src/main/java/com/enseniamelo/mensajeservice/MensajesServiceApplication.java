package com.enseniamelo.mensajeservice;

import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;

import jakarta.annotation.PostConstruct;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan({"com.enseniamelo.mensajeservice", "bo.edu.ucb.microservices.util"})
public class MensajesServiceApplication {

	private static final Logger LOGGER = LoggerFactory.getLogger(MensajesServiceApplication.class);

	@PostConstruct
    public void init() {
        // Configurar zona horaria de Bolivia (UTC-4)
        TimeZone.setDefault(TimeZone.getTimeZone("America/La_Paz"));
    }

	public static void main(String[] args) {
		ConfigurableApplicationContext ctx = SpringApplication.run(MensajesServiceApplication.class, args);

		String mongoUri = ctx.getEnvironment().getProperty("spring.data.mongodb.uri");
		if (mongoUri != null && mongoUri.contains("@")) {
			String sanitizedUri = mongoUri.replaceAll("(?<=//)(.*)(?=@)", "****");
			LOGGER.info("Conexion a Mongo Atlas usando URI: {}", sanitizedUri);
			System.out.println("Conexion exitosa a Mongo Atlas usando URI: " + sanitizedUri);
		} else if (mongoUri != null) {
			LOGGER.info("Conexion a MongoDB en: {}", mongoUri);
		} else {
			LOGGER.warn("Detalles de conexión a MongoDB no encontrados en el entorno.");
		}
	}
}
