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
    // POST: http://localhost:8082/api/chats
    @Operation(
        summary = "${api.chat.create-chat.description}",
        description = "${api.chat.create-chat.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @PostMapping
    @ResponseStatus(code = org.springframework.http.HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    public Mono<ChatDTO> createChat(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "${api.usuario.schema.usuario.description}",
                required = true,
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatDTO.class))
            ) @Valid @RequestBody ChatDTO chatDTO) {
        log.info("POST /api/chats - Crear chat: {}", chatDTO);
        return service.crearChat(chatDTO)
        .doOnSuccess(creado -> log.info("Chat creado exitosamente: {}", creado.getId()))
        .doOnError(error -> log.error("Error al crear el chat: {}", error.getMessage()));
    }

    // ----------------Obtener todos los chats----------------
    // GET: http://localhost:8082/api/chats

    @Operation(
        summary = "${api.chat.get-chats.description}",
        description = "${api.chat.get-chats.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    public Flux<ChatDTO> getChats() {
        log.info("GET /api/chats - Obtener todos los chats");
        return service.obtenerTodos()
        .doOnComplete(() -> log.info("Chats obtenidos exitosamente"))
        .doOnError(error -> log.error("Error al obtener los chats: {}", error.getMessage()));
    }  
    
    // ----------------Obtener chat por id----------------
    // GET: http://localhost:8082/api/chats/{id}
    @Operation(
        summary = "${api.chat.get-chat-by-id.description}",
        description = "${api.chat.get-chat-by-id.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('docente', 'estudiante')")
    public Mono<ChatDTO> getChatsById(
            @Parameter(description = "${api.chat.get-chat-by-id.parameters.id}", required = true)
            @PathVariable @NotBlank String id) {
        return service.obtenerPorId(id)
        .doOnSuccess(chat -> log.info("Chat obtenido exitosamente: {}", chat))
        .doOnError(error -> log.error("Error al obtener el chat: {}", error.getMessage()));
    }

    // ----------------Actualizar chat----------------
    // PUT: http://localhost:8082/api/chats/{id}
    @Operation(
        summary = "${api.chat.update-chat.description}",
        description = "${api.chat.update-chat.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @PutMapping("/{id}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<ChatDTO> updateChat(
        @Parameter(description = "${api.chat.update-chat.parameters.id}", required = true)
        @PathVariable @NotBlank String id, @Valid @RequestBody ChatDTO chatDTO) {
        return service.actualizarChat(id, chatDTO)
                .doOnSuccess(actualizado -> log.info("Chat actualizado exitosamente: {}", actualizado))
                .doOnError(error -> log.error("Error al actualizar el chat: {}", error.getMessage()));
    }

    // ----------------Eliminar chat----------------
    // DELETE: http://localhost:8082/api/chats/{id}
    @Operation(
        summary = "${api.chat.delete-chat.description}",
        description = "${api.chat.delete-chat.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @DeleteMapping("/{id}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<Void> deleteChat(
        @Parameter(description = "${api.chat.delete-chat.parameters.id}", required = true)
        @PathVariable @NotBlank String id) {
        return service.eliminarChat(id)
                .doOnSuccess(v -> log.info("Chat eliminado exitosamente con ID: {}", id))
                .doOnError(error -> log.error("Error al eliminar el chat: {}", error.getMessage()));
    }
}
