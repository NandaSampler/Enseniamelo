package com.enseniamelo.mensajeservice.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;

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

    // ---------------Crear nuevo mensaje----------------
    // POST: http://localhost:8082/api/mensajes

    @Operation(
        summary = "${api.mensaje.create-mensaje.description}",
        description = "${api.mensaje.create-mensaje.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @PostMapping
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    @ResponseStatus(code = org.springframework.http.HttpStatus.CREATED)
    public Mono<MensajeDTO> createMensaje(@io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "${api.mensaje.schema.mensaje.description}",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = MensajeDTO.class))
    ) @Valid @RequestBody MensajeDTO mensajeDTO) {
                log.info("POST /api/mensajes - Crear mensaje: {}", mensajeDTO);
                return service.crearMensaje(mensajeDTO)
                        .doOnSuccess(savedMensajeDTO -> log.info("Mensaje creado exitosamente: {}", savedMensajeDTO))
                        .doOnError(error -> log.error("Error al crear el mensaje: {}", error.getMessage()));
    }

    // ----------------Obtener todos los mensajes----------------
    // GET: http://localhost:8082/api/mensajes

    @Operation(
        summary = "${api.mensaje.get-mensajes.description}",
        description = "${api.mensaje.get-mensajes.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    public Flux<MensajeDTO> getMensajes() {
        return service.obtenerTodos()
        .doOnComplete(() -> log.info("Todos los mensajes obtenidos exitosamente"))
        .doOnError(error -> log.error("Error al obtener los mensajes: {}", error.getMessage()));
    }

    // ---------------Obtener mensaje por id----------------
    // GET: http://localhost:8082/api/mensajes/{id}

    @Operation(
        summary = "${api.mensaje.get-mensaje-by-id.description}",
        description = "${api.mensaje.get-mensaje-by-id.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    public Mono<MensajeDTO> getMensajeById(@Parameter(description = "${api.mensaje.get-mensaje-by-id.parameters.id}", required = true)
            @PathVariable @NotBlank String id) {
        return service.obtenerPorId(id)
                .doOnSuccess(mensajeDTO -> log.info("Mensaje obtenido exitosamente: {}", mensajeDTO))
                .doOnError(error -> log.error("Error al obtener el mensaje: {}", error.getMessage()));
    }

    // ---------------Actualizar mensaje----------------
    // PUT: http://localhost:8082/api/mensajes/{id}

    @Operation(
        summary = "${api.mensaje.update-mensaje.description}",
        description = "${api.mensaje.update-mensaje.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<MensajeDTO> updateMensaje(@Parameter(description = "${api.mensaje.update-mensaje.parameters.id}", required = true)
        @Valid @RequestBody Map<String, String> contenidoNuevo, @PathVariable @NotBlank String id) {
        return service.actualizarContenido(id, contenidoNuevo.get("contenido"))
                .doOnSuccess(updatedMensajeDTO -> log.info("Mensaje actualizado exitosamente: {}", updatedMensajeDTO))
                .doOnError(error -> log.error("Error al actualizar el mensaje: {}", error.getMessage()));
    }

    // ---------------Eliminar mensaje----------------
    // DELETE: http://localhost:8082/api/mensajes/{id}

    @Operation(
        summary = "${api.mensaje.delete-mensaje.description}",
        description = "${api.mensaje.delete-mensaje.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<Void> deleteMensaje(@Parameter(description = "${api.mensaje.delete-mensaje.parameters.id}", required = true)
        @PathVariable @NotBlank String id) {
        return service.eliminarMensaje(id)
                .doOnSuccess(aVoid -> log.info("Mensaje eliminado exitosamente: {}", id))
                .doOnError(error -> log.error("Error al eliminar el mensaje: {}", error.getMessage()));
    }
}
