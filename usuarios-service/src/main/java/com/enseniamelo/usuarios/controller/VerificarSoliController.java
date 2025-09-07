package com.enseniamelo.usuarios.controller;

import com.enseniamelo.usuarios.dto.VerificarSoliDTO;
import com.enseniamelo.usuarios.service.VerificarSoliService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Tag(name = "Verificar-Solicitudes-Controller", description = "Controlador para la gestión de verificaciones de solicitudes")
@RestController
@RequestMapping("/api/verificar-solicitud")
public class VerificarSoliController {

    private final VerificarSoliService service;

    public VerificarSoliController(VerificarSoliService service) {
        this.service = service;
    }

    // ---------------- GET TODAS LAS VERIFICACIONES ----------------
    @Operation(summary = "Obtener todas las verificaciones")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de verificaciones obtenida correctamente")
    })
    @GetMapping
    public Flux<VerificarSoliDTO> getAllVerificaciones() {
        return service.findAll();
    }

    // ---------------- GET VERIFICACIÓN POR ID ----------------
    @Operation(summary = "Obtener una verificación por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verificación encontrada"),
            @ApiResponse(responseCode = "404", description = "Verificación no encontrada")
    })
    @GetMapping("/{id}")
    public Mono<ResponseEntity<VerificarSoliDTO>> getVerificacionById(@PathVariable @Min(1) Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- CREAR VERIFICACIÓN ----------------
    @Operation(summary = "Crear una nueva verificación")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Verificación creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<VerificarSoliDTO> createVerificacion(@Valid @RequestBody VerificarSoliDTO dto) {
        return service.save(dto);
    }

    // ---------------- ACTUALIZAR VERIFICACIÓN ----------------
    @Operation(summary = "Actualizar una verificación existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verificación actualizada correctamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "404", description = "Verificación no encontrada")
    })
    @PutMapping("/{id}")
    public Mono<ResponseEntity<VerificarSoliDTO>> updateVerificacion(@PathVariable @Min(1) Long id,
                                                                     @Valid @RequestBody VerificarSoliDTO dto) {
        return service.update(id, dto)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- ELIMINAR VERIFICACIÓN ----------------
    @Operation(summary = "Eliminar una verificación por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Verificación eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Verificación no encontrada")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ResponseEntity<Void>> deleteVerificacion(@PathVariable @Min(1) Long id) {
        return service.delete(id)
                .map(v -> ResponseEntity.noContent().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
