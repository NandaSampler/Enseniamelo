package com.enseniamelo.commentsservice.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.enseniamelo.commentsservice.dto.CursoDTO;
import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;

import reactor.core.publisher.Mono;

@Component
public class MsCursosIntegration {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(MsCursosIntegration.class);
    
    private final WebClient webClient;
    
    @Value("${cursos.service.url:http://cursoservice:8000}")
    private String cursosServiceUrl;
    
    public MsCursosIntegration(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    public Mono<CursoDTO> obtenerCursoPorId(String idCurso, String token) {
        String url = cursosServiceUrl + "/api/v1/cursos/" + idCurso;
        
        LOGGER.debug("Consultando curso en: {}", url);
        
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(
                    status -> status.value() == HttpStatus.NOT_FOUND.value(),
                    response -> Mono.error(new ResourceNotFoundException("Curso no encontrado con id: " + idCurso))
                )
                .bodyToMono(CursoDTO.class)
                .doOnSuccess(curso -> LOGGER.info("Curso encontrado: {}", curso.getNombre()))
                .doOnError(error -> LOGGER.error("Error obteniendo curso {}: {}", idCurso, error.getMessage()));
    }
    
    public Mono<Boolean> existeCurso(String idCurso, String token) {
        return obtenerCursoPorId(idCurso, token)
                .map(curso -> true)
                .onErrorResume(ResourceNotFoundException.class, e -> Mono.just(false));
    }
}