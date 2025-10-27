package com.enseniamelo.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.CompositeReactiveHealthContributor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthContributor;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class HealthCheckConfiguration {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(HealthCheckConfiguration.class);
    
    private final WebClient.Builder webClientBuilder;
    private final DiscoveryClient discoveryClient;

    public HealthCheckConfiguration(WebClient.Builder webClientBuilder, 
                                   DiscoveryClient discoveryClient) {
        this.webClientBuilder = webClientBuilder;
        this.discoveryClient = discoveryClient;
    }

    @Bean
    ReactiveHealthContributor healthcheckMicroservices() {
        final Map<String, ReactiveHealthIndicator> registry = new LinkedHashMap<>();
        
        // Servicios a verificar
        registry.put("mensajes-service", () -> getHealth("mensajes-service"));
        registry.put("usuarios-service", () -> getHealth("usuarios-service"));
        
        return CompositeReactiveHealthContributor.fromMap(registry);
    }

    private Mono<Health> getHealth(String serviceName) {
        try {
            // Obtener instancias del servicio desde Eureka
            List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
            
            if (instances.isEmpty()) {
                LOGGER.warn("No hay instancias disponibles para {}", serviceName);
                return Mono.just(new Health.Builder()
                        .down()
                        .withDetail("reason", "No instances available")
                        .build());
            }
            
            // Usar la primera instancia disponible
            ServiceInstance instance = instances.get(0);
            String healthUrl = instance.getUri() + "/actuator/health";
            
            LOGGER.debug("Verificando health de {} en URL: {}", serviceName, healthUrl);
            
            return webClientBuilder.build()
                    .get()
                    .uri(healthUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> {
                        LOGGER.debug("Health check exitoso para {}", serviceName);
                        return new Health.Builder().up().build();
                    })
                    .timeout(java.time.Duration.ofSeconds(3))
                    .onErrorResume(ex -> {
                        LOGGER.error("Error en health check de {}: {}", serviceName, ex.getMessage());
                        return Mono.just(new Health.Builder()
                                .down()
                                .withDetail("error", ex.getMessage())
                                .build());
                    });
                    
        } catch (Exception ex) {
            LOGGER.error("Error obteniendo instancias de {}: {}", serviceName, ex.getMessage());
            return Mono.just(new Health.Builder()
                    .down()
                    .withDetail("error", ex.getMessage())
                    .build());
        }
    }
}