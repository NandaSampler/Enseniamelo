package com.enseniamelo.gateway.config;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import reactor.core.publisher.Flux;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  // Security configuration for gateway

  @Bean
  SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) throws Exception {
    http
      .cors(cors -> {})
      .csrf(csrf -> csrf.disable())
      .authorizeExchange(auth -> auth
        .pathMatchers("/actuator/**").permitAll()
        .pathMatchers("/eureka/**").permitAll()
        .pathMatchers("/error/**").permitAll()
        .pathMatchers("/openapi/**").permitAll()
        .pathMatchers("/webjars/**").permitAll()
        .pathMatchers("/favicon.ico", "/favicon.png", "/robots.txt", "/static/**").permitAll()
        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .pathMatchers("/config/encrypt").permitAll()
        .pathMatchers("/config/decrypt").permitAll()
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

        // Accept multiple issuers: common dev cases
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

      @Bean
      public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
      }
}