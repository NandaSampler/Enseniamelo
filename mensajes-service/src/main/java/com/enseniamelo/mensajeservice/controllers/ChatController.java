package com.enseniamelo.mensajeservice.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.mensajeservice.dto.ChatDTO;
import com.enseniamelo.mensajeservice.services.ChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("api/chat")
@Tag(name = "Chat", description = "API para gestionar los chats")
@Slf4j
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    // ----------------Crear chat----------------
    @Operation(summary = "Crear un chat", description = "Crea un nuevo chat con participantes e id_curso")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Chat creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(code = org.springframework.http.HttpStatus.CREATED)
    public Mono<ChatDTO> createChat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "${api.usuario.schema.usuario.description}", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatDTO.class))) @RequestBody ChatDTO chatDTO) {
        log.info("POST /api/chats - Crear chat: {}", chatDTO);
        return service.crearChat(chatDTO)
                .doOnSuccess(creado -> log.info("Chat creado exitosamente: {}", creado.getId()))
                .doOnError(error -> log.error("Error al crear el chat: {}", error.getMessage()));
    }

    // ----------------Obtener todos los chats----------------
    @Operation(summary = "Obtener todos los chats")
    @ApiResponse(responseCode = "200", description = "Lista de chats")
    @GetMapping
    public Flux<ChatDTO> getChats() {
        log.info("GET /api/chat - Obtener todos los chats");
        return service.obtenerTodos()
                .doOnError(e -> log.error("Error al obtener chats: {}", e.getMessage()));
    }

    // ----------------Obtener chat por id----------------
    @Operation(summary = "Obtener chat por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chat encontrado"),
            @ApiResponse(responseCode = "404", description = "Chat no encontrado")
    })
    @GetMapping("/{id}")
    public Mono<ChatDTO> getChatById(@PathVariable @NotBlank String id) {
        return service.obtenerPorId(id)
                .doOnError(e -> log.error("Error al obtener chat: {}", e.getMessage()));
    }

    // ----------------Actualizar chat----------------
    @Operation(summary = "Actualizar chat")
    @PutMapping("/{id}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.OK)
    public Mono<ChatDTO> updateChat(
            @PathVariable @NotBlank String id,
            @Valid @RequestBody ChatDTO chatDTO) {

        return service.actualizarChat(id, chatDTO)
                .doOnError(e -> log.error("Error al actualizar chat: {}", e.getMessage()));
    }

    // ----------------Eliminar chat----------------
    @Operation(summary = "Eliminar chat por ID")
    @DeleteMapping("/{id}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<Void> deleteChat(@PathVariable @NotBlank String id) {

        return service.eliminarChat(id)
                .doOnError(e -> log.error("Error al eliminar chat: {}", e.getMessage()));
    }
}
