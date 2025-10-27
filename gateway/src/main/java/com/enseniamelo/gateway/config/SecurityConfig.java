package com.enseniamelo.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchange -> exchange
                // Rutas públicas - sin autenticación
                .pathMatchers("/v1/auth/login", "/v1/auth/register").permitAll()
                .pathMatchers("/api/v1/auth/**").permitAll()
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/eureka/**").permitAll()
                .pathMatchers("/openapi/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/webjars/**").permitAll()
                
                // Rutas de OAuth2 - necesarias para el flujo de login
                .pathMatchers("/login/**", "/oauth2/**").permitAll()
                
                // Todas las demás rutas requieren autenticación
                .anyExchange().authenticated()
            )
            // ⭐ OAuth2 Login - permite el flujo de autorización con Keycloak
            .oauth2Login(oauth2 -> oauth2
                .authenticationSuccessHandler(new RedirectServerAuthenticationSuccessHandler("http://localhost:5173"))
            )
            // ⭐ OAuth2 Resource Server - valida los JWT
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> {})
            );
        
        return http.build();
    }
}