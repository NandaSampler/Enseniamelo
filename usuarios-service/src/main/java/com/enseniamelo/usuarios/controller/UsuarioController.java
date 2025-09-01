package com.enseniamelo.usuarios.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
        summary = "${api.usuario.get-usuarios.description}",
        description = "${api.usuario.get-usuarios.notes}"
    )
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}") 
    })
    @GetMapping
    public Flux<UsuarioDTO> getUsuarios() {
        return service.findAll();
    }

    @Operation(
        summary = "${api.usuario.get-usuario.description}",
        description = "${api.usuario.get-usuario.notes}"
    )
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}") 
    })
    @GetMapping("/{id}")
    public Mono<UsuarioDTO> getUsuarioById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
