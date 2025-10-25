package com.enseniamelo.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/v1/usuario")
@Tag(name = "Usuario", description = "REST API reactiva para la gestión de usuarios")
@RequiredArgsConstructor
@Slf4j
public class UsuarioController {

    private final UsuarioService usuarioService;
    @Operation(summary = "${api.usuario.get-usuario.description}", 
               description = "${api.usuario.get-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping(value = "/{idUsuario}", produces = "application/json")
    public Mono<UsuarioDTO> getUsuario(
            @Parameter(description = "${api.usuario.get-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario) {

        log.info("GET /v1/usuario/{} - Obteniendo usuario", idUsuario);
        return usuarioService.buscarPorIdUsuario(idUsuario)
            .doOnSuccess(usuario -> log.info("Usuario {} encontrado", idUsuario))
            .doOnError(error -> log.error("Error buscando usuario {}: {}", idUsuario, error.getMessage()));
    }

    @Operation(summary = "${api.usuario.get-usuarios.description}", 
               description = "${api.usuario.get-usuarios.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}")
    })
    @GetMapping(produces = "application/json")
    public Flux<UsuarioDTO> getUsuarios() {
        log.info("GET /v1/usuario - Obteniendo todos los usuarios");
        return usuarioService.obtenerTodos()
            .doOnComplete(() -> log.info("Listado de usuarios completado"))
            .doOnError(error -> log.error("Error obteniendo usuarios: {}", error.getMessage()));
    }

    @Operation(summary = "${api.usuario.create-usuario.description}", 
               description = "${api.usuario.create-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}")
    })
    @PostMapping(consumes = "application/json", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<UsuarioDTO> createUsuario(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "${api.usuario.schema.usuario.description}",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDTO.class))
            )
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        log.info("POST /v1/usuario - Creando nuevo usuario");
        return usuarioService.crearUsuario(usuarioDTO)
            .doOnSuccess(creado -> log.info("Usuario creado con idUsuario: {}", creado.getIdUsuario()))
            .doOnError(error -> log.error("Error creando usuario: {}", error.getMessage()));
    }

    @Operation(summary = "${api.usuario.update-usuario.description}", 
               description = "${api.usuario.update-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @PutMapping(value = "/{idUsuario}", consumes = "application/json", produces = "application/json")
    public Mono<UsuarioDTO> updateUsuario(
            @Parameter(description = "${api.usuario.update-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario,
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        log.info("PUT /v1/usuario/{} - Actualizando usuario", idUsuario);
        return usuarioService.actualizarUsuario(idUsuario, usuarioDTO)
            .doOnSuccess(actualizado -> log.info("Usuario {} actualizado", idUsuario))
            .doOnError(error -> log.error("Error actualizando usuario {}: {}", idUsuario, error.getMessage()));
    }

    @Operation(summary = "${api.usuario.delete-usuario.description}", 
               description = "${api.usuario.delete-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @DeleteMapping(value = "/{idUsuario}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteUsuario(
            @Parameter(description = "${api.usuario.delete-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario) {

        log.info("DELETE /v1/usuario/{} - Eliminando usuario", idUsuario);
        return usuarioService.eliminarPorIdUsuario(idUsuario)
            .doOnSuccess(v -> log.info("Usuario {} eliminado exitosamente", idUsuario))
            .doOnError(error -> log.error("Error eliminando usuario {}: {}", idUsuario, error.getMessage()));
    }
}