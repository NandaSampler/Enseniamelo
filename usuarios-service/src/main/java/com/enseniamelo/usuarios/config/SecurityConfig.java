package com.enseniamelo.usuarios.config;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.web.server.SecurityWebFilterChain;

import reactor.core.publisher.Flux;

@Configuration
@EnableReactiveMethodSecurity()
public class SecurityConfig {	

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(auth -> auth
                // Endpoints públicos - SIEMPRE PRIMERO
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/openapi/**").permitAll()
                .pathMatchers("/swagger-ui/**").permitAll()
                .pathMatchers("/swagger-ui.html").permitAll()
                .pathMatchers("/v3/api-docs/**").permitAll()
                .pathMatchers("/webjars/**").permitAll()
                
                .pathMatchers(HttpMethod.POST, "/v1/auth/login").permitAll()
                .pathMatchers(HttpMethod.POST, "/v1/auth/register").permitAll()
                .pathMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                .pathMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                
                .pathMatchers(HttpMethod.GET, "/v1/auth/me").authenticated()
                .pathMatchers(HttpMethod.GET, "/v1/auth/me/**").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/auth/me/**").authenticated()
                
                // Usuario endpoints 
                .pathMatchers(HttpMethod.GET, "/v1/usuario/**").hasAnyRole("ADMIN", "USER")
                .pathMatchers(HttpMethod.POST, "/v1/usuario").hasRole("ADMIN")
                .pathMatchers(HttpMethod.PUT, "/v1/usuario/**").hasAnyRole("ADMIN", "USER")
                .pathMatchers(HttpMethod.DELETE, "/v1/usuario/**").hasRole("ADMIN")
                
                // Tutor endpoints 
                .pathMatchers(HttpMethod.GET, "/v1/tutores/**").hasAnyRole("ADMIN", "USER", "TUTOR")
                .pathMatchers(HttpMethod.POST, "/v1/tutores").hasRole("ADMIN")
                .pathMatchers(HttpMethod.PUT, "/v1/tutores/**").hasAnyRole("ADMIN", "TUTOR")
                .pathMatchers(HttpMethod.PATCH, "/v1/tutores/*/clasificacion").hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/v1/tutores/**").hasRole("ADMIN")
                
                // Verificacion endpoints
                .pathMatchers(HttpMethod.POST, "/v1/verificacion/usuario/**").authenticated()
                .pathMatchers(HttpMethod.GET, "/v1/verificacion/usuario/**").authenticated()
                .pathMatchers(HttpMethod.GET, "/v1/verificacion/**").hasRole("ADMIN")
                .pathMatchers(HttpMethod.PUT, "/v1/verificacion/**").hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/v1/verificacion/**").hasRole("ADMIN")
                
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }
    
   
    @Bean
	public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
    	ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");

            if (realmAccess == null || realmAccess.get("roles") == null) {
                return Flux.empty();
            }
            @SuppressWarnings("unchecked")
            Collection<String> roles = (Collection<String>) realmAccess.get("roles");

            Collection<GrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toSet());

            return Flux.fromIterable(authorities);
        });

        return converter;
	}

    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder() {
        String jwksUri = "http://keycloak:8080/realms/enseniamelo-realm/protocol/openid-connect/certs";
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwksUri).build();

        List<String> allowedIssuers = Arrays.asList(
            "http://localhost:8080/realms/enseniamelo-realm",
            "http://keycloak:8080/realms/enseniamelo-realm"
        );

        OAuth2TokenValidator<Jwt> timestampValidator = new JwtTimestampValidator();
        OAuth2TokenValidator<Jwt> issuerValidator = token -> {
            String iss = token.getIssuer() == null ? null : token.getIssuer().toString();
            if (iss != null && allowedIssuers.contains(iss)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "The iss claim is not valid", null));
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestampValidator, issuerValidator));
        return decoder;
    }
}