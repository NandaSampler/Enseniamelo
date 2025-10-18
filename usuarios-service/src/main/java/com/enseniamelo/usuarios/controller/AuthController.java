package com.enseniamelo.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.enseniamelo.usuarios.dto.AuthResponse;
import com.enseniamelo.usuarios.dto.LoginRequest;
import com.enseniamelo.usuarios.dto.RegisterRequest;
import com.enseniamelo.usuarios.service.AuthService;

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

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/v1/auth")
@Tag(name = "Autenticación", description = "REST API reactiva para autenticación y registro de usuarios")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Registrar nuevo usuario", 
               description = "Crea una nueva cuenta de usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o email ya existe"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping(value = "/register", consumes = "application/json", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AuthResponse> register(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Datos del nuevo usuario",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterRequest.class))
            )
            @Valid @RequestBody RegisterRequest request) {

        log.info("POST /v1/auth/register - Registrando nuevo usuario: {}", request.getEmail());
        return authService.register(request)
            .doOnSuccess(response -> log.info("Usuario registrado exitosamente con idUsuario: {}", response.getIdUsuario()))
            .doOnError(error -> log.error("Error registrando usuario {}: {}", request.getEmail(), error.getMessage()));
    }

    @Operation(summary = "Iniciar sesión", 
               description = "Autentica un usuario con email y contraseña")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping(value = "/login", consumes = "application/json", produces = "application/json")
    public Mono<AuthResponse> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Credenciales de acceso",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginRequest.class))
            )
            @Valid @RequestBody LoginRequest request) {

        log.info("POST /v1/auth/login - Intento de login para: {}", request.getEmail());
        return authService.login(request)
            .doOnSuccess(response -> log.info("Login exitoso para usuario: {}", request.getEmail()))
            .doOnError(error -> log.error("Error en login para {}: {}", request.getEmail(), error.getMessage()));
    }

    @Operation(summary = "Obtener usuario actual", 
               description = "Retorna los datos del usuario autenticado mediante su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping(value = "/me/{userId}", produces = "application/json")
    public Mono<AuthResponse> getCurrentUser(
            @Parameter(description = "ID del usuario autenticado", required = true)
            @PathVariable String userId) {

        log.info("GET /v1/auth/me/{} - Obteniendo datos del usuario", userId);
        return authService.getUserById(userId)
            .doOnSuccess(response -> log.info("Usuario {} encontrado", userId))
            .doOnError(error -> log.error("Error obteniendo usuario {}: {}", userId, error.getMessage()));
    }

    @Operation(summary = "Cerrar sesión", 
               description = "Cierra la sesión del usuario actual")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sesión cerrada exitosamente")
    })
    @PostMapping(value = "/logout", produces = "application/json")
    public Mono<AuthResponse> logout() {
        log.info("POST /v1/auth/logout - Cerrando sesión");
        return Mono.just(new AuthResponse("Sesión cerrada exitosamente"))
            .doOnSuccess(response -> log.info("Sesión cerrada exitosamente"));
    }
}