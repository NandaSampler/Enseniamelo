package com.enseniamelo.commentsservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.core.convert.converter.Converter;

import java.util.*;
import java.util.stream.Collectors;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {

        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges
                // Swagger y health sin auth
                .pathMatchers(
                    "/openapi/**",
                    "/swagger-ui.html", "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/webjars/**",
                    "/actuator/**"
                ).permitAll()

                // permisos de endpoints
                .pathMatchers(HttpMethod.GET, "/api/comentario-curso/**").permitAll()
                .pathMatchers(HttpMethod.POST, "/api/comentario-curso/**").hasAnyRole("USER", "ADMIN")
                .pathMatchers(HttpMethod.PUT, "/api/comentario-curso/**").hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/comentario-curso/**").hasRole("ADMIN")

                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                    new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter())
                ))
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        Converter<Jwt, Collection<GrantedAuthority>> authoritiesConverter = this::extractAuthorities;
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        List<String> roles = new ArrayList<>();

        // Roles de realm: realm_access.roles
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            Object ra = realmAccess.get("roles");
            if (ra instanceof Collection<?> c) {
                c.stream().filter(Objects::nonNull).map(Object::toString).forEach(roles::add);
            }
        }

        // Roles de cliente: resource_access["enseniamelo-client"].roles
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            Object client = resourceAccess.get("enseniamelo-client");
            if (client instanceof Map<?,?> clientMap) {
                Object cr = clientMap.get("roles");
                if (cr instanceof Collection<?> c) {
                    c.stream().filter(Objects::nonNull).map(Object::toString).forEach(roles::add);
                }
            }
        }

        return roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
