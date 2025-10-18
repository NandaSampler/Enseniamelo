package com.enseniamelo.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/v1/verificacion")
@Tag(name = "Verificación Solicitud", description = "API para gestión de solicitudes de verificación de tutores")
@RequiredArgsConstructor
@Slf4j
public class VerificarSolicitudController {

    private final VerificarSolicitudService solicitudService;

    @Operation(summary = "Crear solicitud de verificación", description = "Un usuario solicita verificación como tutor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o usuario ya tiene solicitud")
    })
    @PostMapping("/usuario/{idUsuario}")
    public Mono<ResponseEntity<VerificarSolicitudDTO>> crearSolicitud(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Integer idUsuario,
            @Valid @RequestBody VerificarSolicitudDTO solicitudDTO) {

        log.info("POST /v1/verificacion/usuario/{} - Creando solicitud", idUsuario);
        return solicitudService.crearSolicitud(idUsuario, solicitudDTO)
                .map(creada -> ResponseEntity.status(HttpStatus.CREATED).body(creada));
    }

    @Operation(summary = "Obtener todas las solicitudes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes obtenida")
    })
    @GetMapping
    public Flux<VerificarSolicitudDTO> obtenerTodas() {
        log.info("GET /v1/verificacion - Obteniendo todas las solicitudes");
        return solicitudService.obtenerTodas();
    }

    @Operation(summary = "Buscar solicitud por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud encontrada"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @GetMapping("/{idVerificar}")
    public Mono<ResponseEntity<VerificarSolicitudDTO>> buscarPorId(
            @Parameter(description = "ID de la solicitud", required = true) @PathVariable Integer idVerificar) {

        log.info("GET /v1/verificacion/{} - Buscando solicitud", idVerificar);
        return solicitudService.buscarPorId(idVerificar)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Buscar solicitud de un usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud encontrada"),
            @ApiResponse(responseCode = "404", description = "Usuario no tiene solicitud")
    })
    @GetMapping("/usuario/{idUsuario}")
    public Mono<ResponseEntity<VerificarSolicitudDTO>> buscarPorUsuario(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Integer idUsuario) {

        log.info("GET /v1/verificacion/usuario/{} - Buscando solicitud del usuario", idUsuario);
        return solicitudService.buscarPorUsuario(idUsuario)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Obtener solicitudes por estado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes obtenida")
    })
    @GetMapping("/estado/{estado}")
    public Flux<VerificarSolicitudDTO> obtenerPorEstado(
            @Parameter(description = "Estado: PENDIENTE, APROBADO, RECHAZADO", required = true) @PathVariable String estado) {

        log.info("GET /v1/verificacion/estado/{} - Obteniendo solicitudes por estado", estado);
        return solicitudService.obtenerPorEstado(estado);
    }

    @Operation(summary = "Aprobar solicitud", description = "Aprueba la solicitud y crea el perfil de tutor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud aprobada exitosamente"),
            @ApiResponse(responseCode = "400", description = "La solicitud ya fue procesada"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @PutMapping("/{idVerificar}/aprobar")
    public Mono<ResponseEntity<VerificarSolicitudDTO>> aprobarSolicitud(
            @Parameter(description = "ID de la solicitud", required = true) @PathVariable Integer idVerificar,
            @RequestBody(required = false) Map<String, String> body) {

        String comentario = body != null ? body.get("comentario") : null;
        log.info("PUT /v1/verificacion/{}/aprobar - Aprobando solicitud", idVerificar);
        return solicitudService.aprobarSolicitud(idVerificar, comentario)
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Rechazar solicitud")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud rechazada"),
            @ApiResponse(responseCode = "400", description = "La solicitud ya fue procesada"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @PutMapping("/{idVerificar}/rechazar")
    public Mono<ResponseEntity<VerificarSolicitudDTO>> rechazarSolicitud(
            @Parameter(description = "ID de la solicitud", required = true) @PathVariable Integer idVerificar,
            @RequestBody(required = false) Map<String, String> body) {

        String comentario = body != null ? body.get("comentario") : "Solicitud rechazada";
        log.info("PUT /v1/verificacion/{}/rechazar - Rechazando solicitud", idVerificar);
        return solicitudService.rechazarSolicitud(idVerificar, comentario)
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Eliminar solicitud")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Solicitud eliminada"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @DeleteMapping("/{idVerificar}")
    public Mono<ResponseEntity<Void>> eliminarSolicitud(
            @Parameter(description = "ID de la solicitud", required = true) @PathVariable Integer idVerificar) {

        log.info("DELETE /v1/verificacion/{} - Eliminando solicitud", idVerificar);
        return solicitudService.eliminarSolicitud(idVerificar)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }
}