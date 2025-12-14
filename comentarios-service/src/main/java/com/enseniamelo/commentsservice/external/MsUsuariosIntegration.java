package com.enseniamelo.commentsservice.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.enseniamelo.commentsservice.dto.UsuarioDTO;
import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;

import reactor.core.publisher.Mono;

@Component
public class MsUsuariosIntegration {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(MsUsuariosIntegration.class);
    
    private final WebClient webClient;
    
    @Value("${usuarios.service.url:http://usuarios-service:8081}")
    private String usuariosServiceUrl;
    
    public MsUsuariosIntegration(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    public Mono<UsuarioDTO> obtenerUsuarioPorId(String idUsuario, String token) {
        String url = usuariosServiceUrl + "/v1/usuario/" + idUsuario;
        
        LOGGER.debug("Consultando usuario en: {}", url);
        
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(
                    status -> status.value() == HttpStatus.NOT_FOUND.value(),
                    response -> Mono.error(new ResourceNotFoundException("Usuario no encontrado con id: " + idUsuario))
                )
                .bodyToMono(UsuarioDTO.class)
                .doOnSuccess(usuario -> LOGGER.info("Usuario encontrado: {}", usuario.getEmail()))
                .doOnError(error -> LOGGER.error("Error obteniendo usuario {}: {}", idUsuario, error.getMessage()));
    }
    
    public Mono<UsuarioDTO> obtenerUsuarioActual(String token) {
        String url = usuariosServiceUrl + "/v1/auth/me";
        
        LOGGER.debug("Consultando usuario actual en: {}", url);
        
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(
                    status -> status.value() == HttpStatus.NOT_FOUND.value(),
                    response -> Mono.error(new ResourceNotFoundException("Usuario no encontrado"))
                )
                .bodyToMono(UsuarioDTO.class)
                .doOnSuccess(usuario -> LOGGER.info("Usuario actual obtenido: {}", usuario.getEmail()))
                .doOnError(error -> LOGGER.error("Error obteniendo usuario actual: {}", error.getMessage()));
    }
    
    public Mono<Boolean> existeUsuario(String idUsuario, String token) {
        return obtenerUsuarioPorId(idUsuario, token)
                .map(usuario -> true)
                .onErrorResume(ResourceNotFoundException.class, e -> Mono.just(false));
    }
}