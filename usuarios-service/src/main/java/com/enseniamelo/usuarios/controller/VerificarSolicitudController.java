package com.enseniamelo.usuarios.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.service.VerificarSolicitudService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/v1/verificacion")
@Tag(name = "Verificación Solicitud", description = "API para gestión de solicitudes de verificación de cursos")
@RequiredArgsConstructor
@Slf4j
public class VerificarSolicitudController {

        private final VerificarSolicitudService solicitudService;

        @Operation(summary = "Crear solicitud para un curso", description = "Curso-service llama este endpoint al crear un curso")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o curso ya tiene solicitud")
        })
        @PostMapping("/curso")
        public Mono<ResponseEntity<Map<String, Object>>> crearSolicitudParaCurso(
                        @Valid @RequestBody VerificarSolicitudDTO solicitudDTO) {

                log.info("POST /v1/verificacion/curso - Creando solicitud para curso: {}", solicitudDTO.getIdCurso());
                
                return solicitudService.crearSolicitudParaCurso(
                                solicitudDTO.getIdUsuario(),
                                solicitudDTO.getIdPerfilTutor(),
                                solicitudDTO.getIdCurso(),
                                solicitudDTO)
                                .map(creada -> ResponseEntity.status(HttpStatus.CREATED)
                                        .body(Map.of(
                                                "success", true,
                                                "solicitud", creada
                                        )));
        }

        @Operation(summary = "Obtener solicitud de un curso")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud encontrada"),
                        @ApiResponse(responseCode = "404", description = "Curso no tiene solicitud")
        })
        @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
        @GetMapping("/curso/{idCurso}")
        public Mono<ResponseEntity<Map<String, Object>>> buscarPorCurso(
                        @Parameter(description = "ID del curso", required = true) @PathVariable String idCurso) {

                log.info("GET /v1/verificacion/curso/{} - Buscando solicitud del curso", idCurso);
                return solicitudService.buscarPorCurso(idCurso)
                                .map(solicitud -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitud", solicitud
                                )))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Obtener todas las solicitudes de un usuario")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de solicitudes del usuario")
        })
        @PreAuthorize("hasRole('ADMIN') or #idUsuario == authentication.principal.claims['sub']")
        @GetMapping("/usuario/{idUsuario}")
        public Mono<ResponseEntity<Map<String, Object>>> buscarPorUsuario(
                        @Parameter(description = "ID de MongoDB del usuario", required = true) @PathVariable String idUsuario) {

                log.info("GET /v1/verificacion/usuario/{} - Buscando solicitudes del usuario", idUsuario);
                return solicitudService.buscarPorUsuario(idUsuario)
                                .collectList()
                                .map(solicitudes -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitudes", solicitudes
                                )));
        }

        @Operation(summary = "Obtener todas las solicitudes de un tutor")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de solicitudes del tutor")
        })
        @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
        @GetMapping("/tutor/{idPerfilTutor}")
        public Mono<ResponseEntity<Map<String, Object>>> buscarPorTutor(
                        @Parameter(description = "ID del perfil de tutor", required = true) @PathVariable String idPerfilTutor) {

                log.info("GET /v1/verificacion/tutor/{} - Buscando solicitudes del tutor", idPerfilTutor);
                return solicitudService.buscarPorTutor(idPerfilTutor)
                                .collectList()
                                .map(solicitudes -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitudes", solicitudes
                                )));
        }

        @Operation(summary = "Obtener todas las solicitudes")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de solicitudes obtenida")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping
        public Mono<ResponseEntity<Map<String, Object>>> obtenerTodas() {
                log.info("GET /v1/verificacion - Obteniendo todas las solicitudes");
                return solicitudService.obtenerTodas()
                                .collectList()
                                .map(solicitudes -> {
                                        log.info("Solicitudes encontradas: {}", solicitudes.size());
                                        return ResponseEntity.ok(Map.of(
                                                "success", true,
                                                "solicitudes", solicitudes
                                        ));
                                });
        }

        @Operation(summary = "Buscar solicitud por ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud encontrada"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/{id}")
        public Mono<ResponseEntity<Map<String, Object>>> buscarPorId(
                        @Parameter(description = "ID de MongoDB de la solicitud", required = true) @PathVariable String id) {

                log.info("GET /v1/verificacion/{} - Buscando solicitud", id);
                return solicitudService.buscarPorId(id)
                                .map(solicitud -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitud", solicitud
                                )))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Obtener solicitudes por estado")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de solicitudes obtenida")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/estado/{estado}")
        public Mono<ResponseEntity<Map<String, Object>>> obtenerPorEstado(
                        @Parameter(description = "Estado: PENDIENTE, APROBADO, RECHAZADO", required = true) @PathVariable String estado) {

                log.info("GET /v1/verificacion/estado/{} - Obteniendo solicitudes por estado", estado);
                return solicitudService.obtenerPorEstado(estado)
                                .collectList()
                                .map(solicitudes -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitudes", solicitudes
                                )));
        }

        @Operation(summary = "Aprobar solicitud", description = "Aprueba la verificación del curso")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud aprobada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "La solicitud ya fue procesada"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{id}/aprobar")
        public Mono<ResponseEntity<Map<String, Object>>> aprobarSolicitud(
                        @Parameter(description = "ID de MongoDB de la solicitud", required = true) @PathVariable String id,
                        @RequestBody(required = false) Map<String, String> body) {

                String comentario = body != null ? body.get("comentario") : null;
                log.info("PUT /v1/verificacion/{}/aprobar - Aprobando solicitud", id);
                return solicitudService.aprobarSolicitud(id, comentario)
                                .map(solicitud -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitud", solicitud
                                )));
        }

        @Operation(summary = "Rechazar solicitud")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud rechazada"),
                        @ApiResponse(responseCode = "400", description = "La solicitud ya fue procesada"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{id}/rechazar")
        public Mono<ResponseEntity<Map<String, Object>>> rechazarSolicitud(
                        @Parameter(description = "ID de MongoDB de la solicitud", required = true) @PathVariable String id,
                        @RequestBody(required = false) Map<String, String> body) {

                String comentario = body != null ? body.get("comentario") : "Solicitud rechazada";
                log.info("PUT /v1/verificacion/{}/rechazar - Rechazando solicitud", id);
                return solicitudService.rechazarSolicitud(id, comentario)
                                .map(solicitud -> ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "solicitud", solicitud
                                )));
        }

        @Operation(summary = "Eliminar solicitud")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Solicitud eliminada"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/{id}")
        public Mono<ResponseEntity<Void>> eliminarSolicitud(
                        @Parameter(description = "ID de MongoDB de la solicitud", required = true) @PathVariable String id) {

                log.info("DELETE /v1/verificacion/{} - Eliminando solicitud", id);
                return solicitudService.eliminarSolicitud(id)
                                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
        }
}