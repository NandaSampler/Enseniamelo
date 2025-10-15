package com.enseniamelo.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import java.util.List;

@RestController
@RequestMapping("/v1/usuario")
@Tag(name = "Usuario", description = "REST API para la gestión de usuarios")
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
    public ResponseEntity<UsuarioDTO> getUsuario(
            @Parameter(description = "${api.usuario.get-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario) {

        log.info("GET /v1/usuario/{} - Obteniendo usuario", idUsuario);
        UsuarioDTO usuario = usuarioService.buscarPorIdUsuario(idUsuario);
        return ResponseEntity.ok(usuario);
    }

    @Operation(summary = "${api.usuario.get-usuarios.description}", 
               description = "${api.usuario.get-usuarios.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}")
    })
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<UsuarioDTO>> getUsuarios() {
        log.info("GET /v1/usuario - Obteniendo todos los usuarios");
        List<UsuarioDTO> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    @Operation(summary = "${api.usuario.create-usuario.description}", 
               description = "${api.usuario.create-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}")
    })
    @PostMapping(consumes = "application/json", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UsuarioDTO> createUsuario(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "${api.usuario.schema.usuario.description}",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDTO.class))
            )
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        log.info("POST /v1/usuario - Creando nuevo usuario con idUsuario: {}", usuarioDTO.getIdUsuario());
        UsuarioDTO usuarioCreado = usuarioService.crearUsuario(usuarioDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCreado);
    }

    @Operation(summary = "${api.usuario.update-usuario.description}", 
               description = "${api.usuario.update-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @PutMapping(value = "/{idUsuario}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UsuarioDTO> updateUsuario(
            @Parameter(description = "${api.usuario.update-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario,
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        log.info("PUT /v1/usuario/{} - Actualizando usuario", idUsuario);
        UsuarioDTO usuarioActualizado = usuarioService.actualizarUsuario(idUsuario, usuarioDTO);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @Operation(summary = "${api.usuario.delete-usuario.description}", 
               description = "${api.usuario.delete-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @DeleteMapping(value = "/{idUsuario}")
    public ResponseEntity<Void> deleteUsuario(
            @Parameter(description = "${api.usuario.delete-usuario.parameters.id}", required = true)
            @PathVariable Integer idUsuario) {

        log.info("DELETE /v1/usuario/{} - Eliminando usuario", idUsuario);
        usuarioService.eliminarPorIdUsuario(idUsuario);
        return ResponseEntity.noContent().build();
    }
}