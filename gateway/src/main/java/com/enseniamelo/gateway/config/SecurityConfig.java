package com.enseniamelo.gateway.config;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

  @Bean
  SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) throws Exception {
    http
        .cors(cors -> {
        }) // habilita CORS (se apoya en CorsWebFilter)
        .csrf(csrf -> csrf.disable())
        .authorizeExchange(auth -> auth
            // Públicos generales
            .pathMatchers("/*/swagger-ui/**", "/*/swagger-ui.html").permitAll()
            .pathMatchers("/*/webjars/**").permitAll()
            .pathMatchers("/*/v3/api-docs/**").permitAll()
            .pathMatchers("/*/openapi/**").permitAll()

            .pathMatchers("/actuator/**").permitAll()
            .pathMatchers("/eureka/**").permitAll()
            .pathMatchers("/error/**").permitAll()
            .pathMatchers("/openapi/**").permitAll()
            .pathMatchers("/webjars/**").permitAll()
            .pathMatchers("/favicon.ico", "/favicon.png", "/robots.txt", "/static/**").permitAll()
            .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .pathMatchers(HttpMethod.POST, "/v1/auth/login").permitAll()
            .pathMatchers(HttpMethod.POST, "/v1/auth/register").permitAll()
            .pathMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
            .pathMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
            .pathMatchers("/v1/auth/login", "/v1/auth/register").permitAll()
            .pathMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
            // Endpoints de config-server (si los expones vía gateway)
            .pathMatchers("/config/encrypt").permitAll()
            .pathMatchers("/config/decrypt").permitAll()

            // Health de microservicios FastAPI
            .pathMatchers("/ms-payments/health").permitAll()
            .pathMatchers("/curso/health").permitAll()

            //Autorizacion chats
            .pathMatchers(HttpMethod.GET, "/v1/chat/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.POST, "/v1/chat/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.PUT, "/v1/chat/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.DELETE, "/v1/chat/**").hasAnyRole("USER", "TUTOR", "ADMIN")

            //Autorizacion mensajes
            .pathMatchers(HttpMethod.GET, "/v1/mensaje/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.POST, "/v1/mensaje/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.PUT, "/v1/mensaje/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers(HttpMethod.DELETE, "/v1/mensaje/**").hasAnyRole("USER", "TUTOR", "ADMIN")

            // Autorización Comentarios
            .pathMatchers(HttpMethod.GET, "/api/comentario-curso/**").permitAll()
            .pathMatchers(HttpMethod.POST, "/api/comentario-curso/**").hasAnyRole("USER", "ADMIN")
            .pathMatchers(HttpMethod.PUT, "/api/comentario-curso/**").hasRole("ADMIN")
            .pathMatchers(HttpMethod.DELETE, "/api/comentario-curso/**").hasRole("ADMIN")

            // Autorización Payments
            .pathMatchers("/ms-payments/v1/pagos/**").hasRole("ADMIN")
            .pathMatchers("/ms-payments/v1/planes/**").hasAnyRole("USER", "TUTOR", "ADMIN")
            .pathMatchers("/ms-payments/v1/suscripciones/**").hasAnyRole("USER", "TUTOR", "ADMIN")

            // Documentación de cursos pública
            .pathMatchers("/curso/docs", "/curso/redoc", "/curso/openapi.json").permitAll()
            // 1) Endpoints de cursos / categorias / horarios PUBLICOS (solo GET)
            .pathMatchers(HttpMethod.GET, "/curso/api/v1/cursos/**").permitAll()
            .pathMatchers(HttpMethod.GET, "/curso/api/v1/categorias/**").permitAll()
            .pathMatchers(HttpMethod.GET, "/curso/api/v1/horarios/**").permitAll()

            // 2) Reservas: requieren usuario logueado (USER/TUTOR/ADMIN)
            .pathMatchers("/curso/api/v1/reservas/**").hasAnyRole("USER", "TUTOR", "ADMIN")

            // 3) Gestión de cursos (crear/editar/borrar, asignar categorías)
            .pathMatchers("/curso/api/v1/cursos/**").hasAnyRole("TUTOR", "ADMIN")

            // 4) Gestión de horarios
            .pathMatchers("/curso/api/v1/horarios/**").hasAnyRole("TUTOR", "ADMIN")

            // 5) Gestión de categorías (crear/editar/borrar)
            .pathMatchers("/curso/api/v1/categorias/**").hasRole("ADMIN")

            // Todo lo demás autenticado
            .anyExchange().authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

    return http.build();
  }

  /**
   * Convierte los roles de Keycloak (realm_access.roles) en authorities de
   * Spring:
   * ROLE_<ROL>
   * Ej: "CURSO_ADMIN" -> "ROLE_CURSO_ADMIN"
   */
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

  /**
   * Decoder JWT explícito usando el JWKS de Keycloak, permitiendo issuer tanto
   * con localhost como con "keycloak" (útil para local + docker).
   */
  @Bean
  public ReactiveJwtDecoder reactiveJwtDecoder() {
    String jwksUri = "http://keycloak:8080/realms/enseniamelo-realm/protocol/openid-connect/certs";
    NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwksUri).build();

    // Issuers aceptados (para desarrollo/local + docker)
    List<String> allowedIssuers = Arrays.asList(
        "http://localhost:8080/realms/enseniamelo-realm",
        "http://keycloak:8080/realms/enseniamelo-realm");

    OAuth2TokenValidator<Jwt> timestampValidator = new JwtTimestampValidator();
    OAuth2TokenValidator<Jwt> issuerValidator = token -> {
      String iss = token.getIssuer() == null ? null : token.getIssuer().toString();
      if (iss != null && allowedIssuers.contains(iss)) {
        return OAuth2TokenValidatorResult.success();
      }
      return OAuth2TokenValidatorResult.failure(
          new OAuth2Error("invalid_token", "The iss claim is not valid", null));
    };

    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestampValidator, issuerValidator));

    return decoder;
  }

  /**
   * Filtro CORS adicional (complementa lo que tienes en application.yml).
   * Aquí ponemos al menos el origin del Vite dev server.
   */
  @Bean
  public CorsWebFilter corsWebFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.addAllowedOrigin("http://localhost:5173");
    config.addAllowedOrigin("http://127.0.0.1:5173");
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