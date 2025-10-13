package com.enseniamelo.usuarios.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(value = "/v1/usuario")
@Tag(name = "Usuario", description = "REST API para la gestión de usuarios")
public class UsuarioController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsuarioController.class);

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // ---------------------- GET USUARIO POR ID (Mongo) ----------------------
    @Operation(summary = "${api.usuario.get-usuario.description}", 
               description = "${api.usuario.get-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping(value = "/{id}", produces = "application/json")
    public UsuarioDTO getUsuario(
            @Parameter(description = "${api.usuario.get-usuario.parameters.id}", required = true)
            @PathVariable String id) {

        LOGGER.info("Obteniendo usuario por id: {}", id);
        Optional<UsuarioDTO> usuario = usuarioService.buscarPorId(id);
        if (usuario.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado con id: " + id);
        }
        return usuario.get();
    }

    // ---------------------- GET TODOS LOS USUARIOS ----------------------
    @Operation(summary = "${api.usuario.get-usuarios.description}", 
               description = "${api.usuario.get-usuarios.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}")
    })
    @GetMapping(produces = "application/json")
    public List<UsuarioDTO> getUsuarios() {
        LOGGER.debug("Obteniendo todos los usuarios");
        return usuarioService.obtenerTodos();
    }

    // ---------------------- CREAR USUARIO ----------------------
    @Operation(summary = "${api.usuario.create-usuario.description}", 
               description = "${api.usuario.create-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}")
    })
    @PostMapping(consumes = "application/json", produces = "application/json")
    public UsuarioDTO createUsuario(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "${api.usuario.schema.usuario.description}",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDTO.class))
            )
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        LOGGER.debug("Creando nuevo usuario: {}", usuarioDTO);
        return usuarioService.crearUsuario(usuarioDTO);
    }

    // ---------------------- ACTUALIZAR USUARIO ----------------------
    @Operation(summary = "${api.usuario.update-usuario.description}", 
               description = "${api.usuario.update-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
    public UsuarioDTO updateUsuario(
            @Parameter(description = "${api.usuario.update-usuario.parameters.id}", required = true)
            @PathVariable String id,
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        LOGGER.debug("Actualizando usuario con id: {}", id);
        return usuarioService.actualizarUsuario(id, usuarioDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // ---------------------- ELIMINAR USUARIO ----------------------
    @Operation(summary = "${api.usuario.delete-usuario.description}", 
               description = "${api.usuario.delete-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @DeleteMapping(value = "/{id}")
    public void deleteUsuario(
            @Parameter(description = "${api.usuario.delete-usuario.parameters.id}", required = true)
            @PathVariable String id) {

        LOGGER.debug("Eliminando usuario con id: {}", id);
        Optional<UsuarioDTO> usuario = usuarioService.buscarPorId(id);
        if (usuario.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado con id: " + id);
        }
        usuarioService.eliminarUsuario(id);
    }
}
