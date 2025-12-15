package com.enseniamelo.usuarios.external;

import java.io.IOException;
import java.util.logging.Level;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.enseniamelo.usuarios.dto.CursoDTO;
import com.enseniamelo.usuarios.util.exception.InvalidInputException;
import com.enseniamelo.usuarios.util.exception.NotFoundException;
import com.enseniamelo.usuarios.util.http.HttpErrorInfo;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class MsCursoIntegration {

    private static final Logger LOGGER = LoggerFactory.getLogger(MsCursoIntegration.class);
    private static final String CURSO_SERVICE_URL = "http://cursoservice:8000";

    private final WebClient webClient;
    private final ObjectMapper mapper;

    @Autowired
    public MsCursoIntegration(WebClient.Builder webClient, ObjectMapper mapper) {
        this.webClient = webClient.build();
        this.mapper = mapper;
    }

    public Mono<CursoDTO> getCurso(String cursoId) {
        String url = CURSO_SERVICE_URL + "/api/v1/cursos/" + cursoId;
        LOGGER.debug("Llamando getCurso API en URL: {}", url);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(CursoDTO.class)
                .log(LOGGER.getName(), Level.FINE)
                .onErrorMap(WebClientResponseException.class, this::handleException);
    }

    public Flux<CursoDTO> getCursosByTutor(String tutorId) {
        String url = CURSO_SERVICE_URL + "/api/v1/cursos?tutor_id=" + tutorId;
        LOGGER.debug("Llamando getCursosByTutor API en URL: {}", url);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToFlux(CursoDTO.class)
                .log(LOGGER.getName(), Level.FINE)
                .onErrorMap(WebClientResponseException.class, this::handleException);
    }

    public Mono<Void> updateCursoVerificacion(String cursoId, String estadoVerificacion) {
        String url = CURSO_SERVICE_URL + "/api/v1/cursos/" + cursoId + "/verificacion";
        LOGGER.debug("Actualizando verificación del curso {} a estado: {}", cursoId, estadoVerificacion);

        CursoVerificacionUpdate update = new CursoVerificacionUpdate(estadoVerificacion);

        return webClient.put()
                .uri(url)
                .bodyValue(update)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> LOGGER.info("Estado de verificación actualizado para curso: {}", cursoId))
                .doOnError(error -> LOGGER.error("Error actualizando verificación del curso {}: {}", 
                        cursoId, error.getMessage()))
                .onErrorMap(WebClientResponseException.class, this::handleException);
    }

    private Throwable handleException(Throwable ex) {
        if (!(ex instanceof WebClientResponseException)) {
            LOGGER.warn("Error inesperado: {}", ex.toString());
            return ex;
        }

        WebClientResponseException wcre = (WebClientResponseException) ex;
        HttpStatus status = HttpStatus.resolve(wcre.getStatusCode().value());

        if (status == null) {
            LOGGER.warn("Error HTTP desconocido: {}", wcre.getStatusCode());
            return ex;
        }

        switch (status) {
            case NOT_FOUND:
                return new NotFoundException(getErrorMessage(wcre));
            case UNPROCESSABLE_ENTITY:
            case BAD_REQUEST:
                return new InvalidInputException(getErrorMessage(wcre));
            default:
                LOGGER.warn("Error HTTP inesperado: {}", wcre.getStatusCode());
                LOGGER.warn("Cuerpo del error: {}", wcre.getResponseBodyAsString());
                return ex;
        }
    }

    private String getErrorMessage(WebClientResponseException ex) {
        try {
            return mapper.readValue(ex.getResponseBodyAsString(), HttpErrorInfo.class)
                    .getMessage();
        } catch (IOException ioex) {
            return ex.getMessage();
        }
    }

    private static class CursoVerificacionUpdate {
        private final String estadoVerificacion;

        public CursoVerificacionUpdate(String estadoVerificacion) {
            this.estadoVerificacion = estadoVerificacion;
        }

        public String getEstadoVerificacion() {
            return estadoVerificacion;
        }
    }
}
