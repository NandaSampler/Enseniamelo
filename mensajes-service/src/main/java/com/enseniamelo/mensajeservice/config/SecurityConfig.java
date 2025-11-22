package com.enseniamelo.mensajeservice.config;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchange -> exchange
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .build();
    }
    
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            
            if (realmAccess == null) {
                return Flux.empty();
            }
            
            Object rolesObj = realmAccess.get("roles");
            if (rolesObj == null) {
                return Flux.empty();
            }
            
            @SuppressWarnings("unchecked")
            Collection<String> roles = (Collection<String>) rolesObj;
            
            Collection<GrantedAuthority> authorities = roles.stream()
                .map(role -> {
                    String authority = "ROLE_" + role;
                    return new SimpleGrantedAuthority(authority);
                })
                .collect(Collectors.toList());
            
            return Flux.fromIterable(authorities);
        });
        
        return converter;
    }
}