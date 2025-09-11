package com.enseniamelo.mensajeservice.controllers;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.services.MensajeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("api/mensajes")
@Tag(name = "Mensaje", description = "API para gestionar los mensajes")
public class MensajeController {
    
    private final MensajeService service;

    public MensajeController(MensajeService service) {
        this.service = service;
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
    public Flux<MensajeDTO> getMensajes() {
        return service.findAll();
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
    public Mono<MensajeDTO> getMensajeById(@Min(1)  Long id) {
        return service.findById(id);
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
    @ResponseStatus(code = org.springframework.http.HttpStatus.CREATED)
    public Mono<MensajeDTO> createMensaje(@Valid @RequestBody MensajeDTO mensajeDTO) {
        return service.createMensaje(mensajeDTO);
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
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<MensajeDTO> updateMensaje(@Valid @RequestBody MensajeDTO mensajeDTO, @Min(1)  Long id) {
        return service.updateMensaje(id, mensajeDTO);
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
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<Void> deleteMensaje(@Min(1) Long id) {
        return service.deleteMensaje(id);
    }
}
