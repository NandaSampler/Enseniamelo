package com.enseniamelo.commentsservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Servicio para validar reservas con el microservicio de cursos
 */
@Service
public class ReservaValidationService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(ReservaValidationService.class);
    
    private final WebClient webClient;
    
    @Value("${cursos.service.url:http://cursoservice:8000}")
    private String cursosServiceUrl;
    
    public ReservaValidationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    /**
     * Verifica si el usuario tiene una reserva completada para el curso especificado
     * 
     * @param idUsuario ID del usuario
     * @param idCurso ID del curso
     * @param token Token de autenticación
     * @return true si tiene reserva completada, false en caso contrario
     */
    public Mono<Boolean> tieneReservaCompletada(String idUsuario, String idCurso, String token) {
        String url = cursosServiceUrl + "/api/v1/reservas";
        
        LOGGER.debug("Consultando reservas en: {} para usuario {} y curso {}", 
                url, idUsuario, idCurso);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(url)
                        .queryParam("id_usuario", idUsuario)
                        .queryParam("id_curso", idCurso)
                        .queryParam("estado", "completada")
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(ReservaListResponse.class)
                .map(response -> {
                    boolean tieneReserva = response.isSuccess() 
                            && response.getReservas() != null 
                            && !response.getReservas().isEmpty();
                    
                    LOGGER.info("Usuario {} {} reserva completada para curso {}", 
                            idUsuario, 
                            tieneReserva ? "tiene" : "NO tiene",
                            idCurso);
                    
                    return tieneReserva;
                })
                .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                    LOGGER.warn("No se encontraron reservas para usuario {} y curso {}", 
                            idUsuario, idCurso);
                    return Mono.just(false);
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    LOGGER.error("Error HTTP consultando reservas: {} - {}", 
                            e.getStatusCode(), e.getResponseBodyAsString());
                    return Mono.just(false);
                })
                .onErrorResume(Exception.class, e -> {
                    LOGGER.error("Error inesperado consultando reservas: {}", e.getMessage(), e);
                    return Mono.just(false);
                });
    }
    
    // ===== DTOs internos para deserializar la respuesta =====
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReservaListResponse {
        private boolean success;
        private List<ReservaDTO> reservas;
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public List<ReservaDTO> getReservas() {
            return reservas;
        }
        
        public void setReservas(List<ReservaDTO> reservas) {
            this.reservas = reservas;
        }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReservaDTO {
        private String id;
        
        @JsonProperty("id_usuario")
        private String idUsuario;
        
        @JsonProperty("id_curso")
        private String idCurso;
        
        @JsonProperty("id_horario")
        private String idHorario;
        
        private boolean pago;
        private String estado;
        private Double monto;
        
        // Getters y Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getIdUsuario() {
            return idUsuario;
        }
        
        public void setIdUsuario(String idUsuario) {
            this.idUsuario = idUsuario;
        }
        
        public String getIdCurso() {
            return idCurso;
        }
        
        public void setIdCurso(String idCurso) {
            this.idCurso = idCurso;
        }
        
        public String getIdHorario() {
            return idHorario;
        }
        
        public void setIdHorario(String idHorario) {
            this.idHorario = idHorario;
        }
        
        public boolean isPago() {
            return pago;
        }
        
        public void setPago(boolean pago) {
            this.pago = pago;
        }
        
        public String getEstado() {
            return estado;
        }
        
        public void setEstado(String estado) {
            this.estado = estado;
        }
        
        public Double getMonto() {
            return monto;
        }
        
        public void setMonto(Double monto) {
            this.monto = monto;
        }
    }
}