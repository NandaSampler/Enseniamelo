package com.enseniamelo.gateway.config;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

  @Bean
  SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .authorizeExchange(auth -> auth
        .pathMatchers("/actuator/**").permitAll()
        .pathMatchers("/eureka/**").permitAll()
        .pathMatchers("/error/**").permitAll()
        .pathMatchers("/openapi/**").permitAll()
        .pathMatchers("/webjars/**").permitAll()
        .pathMatchers("/favicon.ico", "/favicon.png", "/robots.txt", "/static/**").permitAll()
        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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

}