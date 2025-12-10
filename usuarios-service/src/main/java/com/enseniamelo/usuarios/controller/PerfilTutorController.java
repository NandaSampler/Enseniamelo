package com.enseniamelo.usuarios.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.service.PerfilTutorService;

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

@RestController
@RequestMapping("/v1/tutores")
@Tag(name = "Perfil Tutor", description = "API para gestión de perfiles de tutores")
@RequiredArgsConstructor
@Slf4j
public class PerfilTutorController {

    private final PerfilTutorService perfilTutorService;

    @Operation(summary = "Obtener todos los tutores")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de tutores obtenida")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
    @GetMapping
    public Flux<PerfilTutorDTO> obtenerTodos() {
        log.info("GET /v1/tutores - Obteniendo todos los tutores");
        return perfilTutorService.obtenerTodos();
    }

    @Operation(summary = "Buscar tutor por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tutor encontrado"),
            @ApiResponse(responseCode = "404", description = "Tutor no encontrado")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
    @GetMapping("/{idTutor}")
    public Mono<ResponseEntity<PerfilTutorDTO>> buscarPorId(
            @Parameter(description = "ID del tutor", required = true) @PathVariable Integer idTutor) {

        log.info("GET /v1/tutores/{} - Buscando tutor", idTutor);
        return perfilTutorService.buscarPorId(idTutor)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Buscar perfil de tutor por ID de usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no tiene perfil de tutor")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('TUTOR')")
    @GetMapping("/usuario/{idUsuario}")
    public Mono<ResponseEntity<PerfilTutorDTO>> buscarPorUsuario(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Integer idUsuario) {

        log.info("GET /v1/tutores/usuario/{} - Buscando perfil del usuario", idUsuario);
        return perfilTutorService.buscarPorUsuario(idUsuario)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Obtener tutores verificados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de tutores verificados")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
    @GetMapping("/verificados")
    public Flux<PerfilTutorDTO> obtenerVerificados() {
        log.info("GET /v1/tutores/verificados - Obteniendo tutores verificados");
        return perfilTutorService.obtenerVerificados();
    }

    @Operation(summary = "Obtener tutores con clasificación mínima")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de tutores filtrados")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
    @GetMapping("/clasificacion/{minima}")
    public Flux<PerfilTutorDTO> obtenerPorClasificacion(
            @Parameter(description = "Clasificación mínima (0-5)", required = true) @PathVariable Float minima) {

        log.info("GET /v1/tutores/clasificacion/{} - Filtrando por clasificación", minima);
        return perfilTutorService.obtenerPorClasificacionMinima(minima);
    }

    @Operation(summary = "Actualizar perfil de tutor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil actualizado"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
    @PutMapping("/{idTutor}")
    public Mono<ResponseEntity<PerfilTutorDTO>> actualizarPerfil(
            @Parameter(description = "ID del tutor", required = true) @PathVariable Integer idTutor,
            @Valid @RequestBody PerfilTutorDTO perfilDTO) {

        log.info("PUT /v1/tutores/{} - Actualizando perfil", idTutor);
        return perfilTutorService.actualizarPerfil(idTutor, perfilDTO)
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Actualizar clasificación de tutor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Clasificación actualizada"),
            @ApiResponse(responseCode = "404", description = "Tutor no encontrado")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{idTutor}/clasificacion")
    public Mono<ResponseEntity<PerfilTutorDTO>> actualizarClasificacion(
            @Parameter(description = "ID del tutor", required = true) @PathVariable Integer idTutor,
            @RequestBody Map<String, Float> body) {

        Float clasificacion = body.get("clasificacion");
        log.info("PATCH /v1/tutores/{}/clasificacion - Actualizando clasificación a {}", idTutor, clasificacion);
        return perfilTutorService.actualizarClasificacion(idTutor, clasificacion)
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Eliminar perfil de tutor")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Perfil eliminado"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{idTutor}")
    public Mono<ResponseEntity<Void>> eliminarPerfil(
            @Parameter(description = "ID del tutor", required = true) @PathVariable Integer idTutor) {

        log.info("DELETE /v1/tutores/{} - Eliminando perfil", idTutor);
        return perfilTutorService.eliminarPerfil(idTutor)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }
}