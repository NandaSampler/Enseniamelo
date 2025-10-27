package com.enseniamelo.usuarios.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {
    
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchange -> exchange
                // ============ ENDPOINTS PÚBLICOS ============
                // Actuator (para healthchecks de Docker)
                .pathMatchers("/actuator/**").permitAll()
                
                // Swagger/OpenAPI
                .pathMatchers("/openapi/**", "/swagger-ui/**", "/v3/api-docs/**", "/webjars/**").permitAll()
                
                // Endpoints de autenticación (login/register)
                .pathMatchers("/v1/auth/login", "/v1/auth/register").permitAll()
                
                // ============ ENDPOINTS PROTEGIDOS ============
                // Todo lo demás requiere autenticación JWT
                .anyExchange().authenticated()
            )
            // Validar JWT como Resource Server
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        
        return http.build();
    }
}