package com.enseniamelo.gateway.config;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.CompositeReactiveHealthContributor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthContributor;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
public class HealthCheckConfiguration {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(HealthCheckConfiguration.class);
    
    private final WebClient webClient;

    @Autowired
    public HealthCheckConfiguration(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Bean
    ReactiveHealthContributor healthcheckMicroservices() {
        final Map<String, ReactiveHealthIndicator> registry = new LinkedHashMap<>();
        
        // Agrega aquí todos tus microservicios
        registry.put("usuarios-service", () -> getHealth("http://usuarios-service"));
        return CompositeReactiveHealthContributor.fromMap(registry);
    }

    private Mono<Health> getHealth(String baseUrl) {
        String url = baseUrl + "/actuator/health";
        LOGGER.debug("Llamando al API Health en URL: {}", url);
        
        return webClient.get()
            .uri(url)
            .retrieve()
            .bodyToMono(String.class)
            .map(s -> new Health.Builder().up().build())
            .onErrorResume(ex -> {
                LOGGER.error("Error al consultar health de {}: {}", baseUrl, ex.getMessage());
                return Mono.just(new Health.Builder().down(ex).build());
            })
            .log(LOGGER.getName(), Level.FINE);
    }
}