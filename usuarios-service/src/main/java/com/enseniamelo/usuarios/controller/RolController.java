package com.enseniamelo.usuarios.controller;

import com.enseniamelo.usuarios.dto.RolDTO;
import com.enseniamelo.usuarios.service.RolService;
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

@Tag(name = "Rol-Controller", description = "Controlador para la gestión de roles")
@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService service;

    public RolController(RolService service) {
        this.service = service;
    }

    // ---------------- GET TODOS LOS ROLES ----------------
    @Operation(summary = "Obtener todos los roles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de roles obtenida correctamente")
    })
    @GetMapping
    public Flux<RolDTO> getAllRoles() {
        return service.findAll();
    }

    // ---------------- GET ROL POR ID ----------------
    @Operation(summary = "Obtener un rol por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Rol encontrado"),
            @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    })
    @GetMapping("/{id}")
    public Mono<ResponseEntity<RolDTO>> getRolById(@PathVariable @Min(1) Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- CREAR ROL ----------------
    @Operation(summary = "Crear un nuevo rol")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Rol creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<RolDTO> createRol(@Valid @RequestBody RolDTO rolDTO) {
        return service.save(rolDTO);
    }

    // ---------------- ACTUALIZAR ROL ----------------
    @Operation(summary = "Actualizar un rol existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Rol actualizado correctamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    })
    @PutMapping("/{id}")
    public Mono<ResponseEntity<RolDTO>> updateRol(@PathVariable @Min(1) Long id,
                                                  @Valid @RequestBody RolDTO rolDTO) {
        return service.update(id, rolDTO)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ---------------- ELIMINAR ROL ----------------
    @Operation(summary = "Eliminar un rol por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Rol eliminado correctamente"),
            @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ResponseEntity<Void>> deleteRol(@PathVariable @Min(1) Long id) {
        return service.delete(id)
                .map(v -> ResponseEntity.noContent().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
