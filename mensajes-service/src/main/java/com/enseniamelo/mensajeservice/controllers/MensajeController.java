package com.enseniamelo.mensajeservice.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.services.MensajeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("api/mensaje")
@Tag(name = "Mensaje", description = "API para gestionar los mensajes")
@Slf4j
public class MensajeController {
    
    private final MensajeService service;

    public MensajeController(MensajeService service) {
        this.service = service;
    }

    // ----------------Crear mensaje----------------
    @Operation(summary = "Crear un mensaje")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Mensaje creado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(code = org.springframework.http.HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USER', 'TUTOR')")
    public Mono<MensajeDTO> createMensaje(
        @Valid @RequestBody MensajeDTO mensajeDTO) {

        log.info("POST /api/mensaje - Crear mensaje: {}", mensajeDTO);

        return service.crearMensaje(mensajeDTO)
            .doOnError(e -> log.error("Error al crear mensaje: {}", e.getMessage()));
    }

    // ----------------Obtener todos----------------
    @Operation(summary = "Obtener todos los mensajes")
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TUTOR')")
    public Flux<MensajeDTO> getMensajes() {
        return service.obtenerTodos()
            .doOnError(e -> log.error("Error al obtener mensajes: {}", e.getMessage()));
    }

    // ----------------Obtener mensaje por ID----------------
    @Operation(summary = "Obtener mensaje por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TUTOR')")
    public Mono<MensajeDTO> getMensajeById(@PathVariable @NotBlank String id) {
        return service.obtenerPorId(id)
            .doOnError(e -> log.error("Error al obtener mensaje: {}", e.getMessage()));
    }

    // ----------------Actualizar contenido----------------
    @Operation(summary = "Actualizar el contenido del mensaje")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TUTOR')")
    public Mono<MensajeDTO> updateMensaje(
        @PathVariable @NotBlank String id,
        @RequestBody Map<String, String> contenidoNuevo) {

        return service.actualizarContenido(id, contenidoNuevo.get("contenido"))
            .doOnError(e -> log.error("Error al actualizar mensaje: {}", e.getMessage()));
    }

    // ----------------Eliminar mensaje----------------
    @Operation(summary = "Eliminar un mensaje")
    @DeleteMapping("/{id}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('USER', 'TUTOR')")
    public Mono<Void> deleteMensaje(@PathVariable @NotBlank String id) {
        return service.eliminarMensaje(id)
            .doOnError(e -> log.error("Error al eliminar mensaje: {}", e.getMessage()));
    }
}
