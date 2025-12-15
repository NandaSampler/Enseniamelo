package com.enseniamelo.usuarios.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

        @Operation(summary = "${api.usuario.get-usuario.description}", description = "${api.usuario.get-usuario.notes}")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
                        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
                        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
        })
        @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
        @GetMapping(value = "/{id}", produces = "application/json")
        public Mono<UsuarioDTO> getUsuario(
                        @Parameter(description = "ID de MongoDB del usuario", required = true) @PathVariable String id) {

                log.info("GET /v1/usuario/{} - Obteniendo usuario", id);
                return usuarioService.buscarPorId(id)
                                .doOnSuccess(usuario -> log.info("Usuario {} encontrado", id))
                                .doOnError(error -> log.error("Error buscando usuario {}: {}", id, error.getMessage()));
        }

        @Operation(summary = "${api.usuario.get-usuarios.description}", description = "${api.usuario.get-usuarios.notes}")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}")
        })
        @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
        @GetMapping(produces = "application/json")
        public Flux<UsuarioDTO> getUsuarios() {
                log.info("GET /v1/usuario - Obteniendo todos los usuarios");
                return usuarioService.obtenerTodos()
                                .doOnComplete(() -> log.info("Listado de usuarios completado"))
                                .doOnError(error -> log.error("Error obteniendo usuarios: {}", error.getMessage()));
        }

        @Operation(summary = "${api.usuario.create-usuario.description}", description = "${api.usuario.create-usuario.notes}")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
                        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}")
        })
        @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
        @PostMapping(consumes = "application/json", produces = "application/json")
        public Mono<UsuarioDTO> createUsuario(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "${api.usuario.schema.usuario.description}", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDTO.class))) @Valid @RequestBody UsuarioDTO usuarioDTO) {

                log.info("POST /v1/usuario - Creando nuevo usuario");
                return usuarioService.crearUsuario(usuarioDTO)
                                .doOnSuccess(creado -> log.info("Usuario creado con id: {}", creado.getId()))
                                .doOnError(error -> log.error("Error creando usuario: {}", error.getMessage()));
        }

        @Operation(summary = "${api.usuario.update-usuario.description}", description = "${api.usuario.update-usuario.notes}")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
                        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
        })
        @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
        @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
        public Mono<UsuarioDTO> updateUsuario(
                        @Parameter(description = "ID de MongoDB del usuario", required = true) @PathVariable String id,
                        @Valid @RequestBody UsuarioDTO usuarioDTO) {

                log.info("PUT /v1/usuario/{} - Actualizando usuario", id);
                return usuarioService.actualizarUsuario(id, usuarioDTO)
                                .doOnSuccess(actualizado -> log.info("Usuario {} actualizado", id))
                                .doOnError(error -> log.error("Error actualizando usuario {}: {}", id,
                                                error.getMessage()));
        }

        @Operation(summary = "${api.usuario.delete-usuario.description}", description = "${api.usuario.delete-usuario.notes}")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
                        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping(value = "/{id}")
        public Mono<Void> deleteUsuario(
                        @Parameter(description = "ID de MongoDB del usuario", required = true) @PathVariable String id) {

                log.info("DELETE /v1/usuario/{} - Eliminando usuario", id);
                return usuarioService.eliminarPorId(id)
                                .doOnSuccess(v -> log.info("Usuario {} eliminado exitosamente", id))
                                .doOnError(error -> log.error("Error eliminando usuario {}: {}", id,
                                                error.getMessage()));
        }
}
