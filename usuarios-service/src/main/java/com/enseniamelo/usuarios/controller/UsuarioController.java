package com.enseniamelo.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // ---------------- GET TODOS LOS USUARIOS ----------------
    @Operation(summary = "${api.usuario.get-usuarios.description}",
               description = "${api.usuario.get-usuarios.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping
    public Flux<UsuarioDTO> getUsuarios() {
        return service.findAll();
    }

    // ---------------- GET USUARIO POR ID ----------------
    @Operation(summary = "${api.usuario.get-usuario.description}",
               description = "${api.usuario.get-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping("/{id}")
    public Mono<ResponseEntity<UsuarioDTO>> getUsuarioById(@PathVariable @Min(1) Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- CREAR USUARIO ----------------
    @Operation(summary = "${api.usuario.create-usuario.description}",
               description = "${api.usuario.create-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "${api.responseCodes.created.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<UsuarioDTO> createUsuario(@Valid @RequestBody UsuarioDTO usuario) {
        return service.save(usuario);
    }

    // ---------------- ACTUALIZAR USUARIO ----------------
    @Operation(summary = "${api.usuario.update-usuario.description}",
               description = "${api.usuario.update-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @PutMapping("/{id}")
    public Mono<ResponseEntity<UsuarioDTO>> updateUsuario(
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody UsuarioDTO usuario) {
        return service.update(id, usuario)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- ELIMINAR USUARIO ----------------
    @Operation(summary = "${api.usuario.delete-usuario.description}",
               description = "${api.usuario.delete-usuario.notes}")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "${api.responseCodes.noContent.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ResponseEntity<Void>> deleteUsuario(@PathVariable @Min(1) Long id) {
        return service.delete(id)
                .map(v -> ResponseEntity.noContent().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
