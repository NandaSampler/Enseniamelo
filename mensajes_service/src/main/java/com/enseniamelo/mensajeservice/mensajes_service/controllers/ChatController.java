package com.enseniamelo.mensajeservice.mensajes_service.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.mensajeservice.mensajes_service.dto.ChatDTO;
import com.enseniamelo.mensajeservice.mensajes_service.services.ChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("api/chats")
@Tag(name = "Chat", description = "API para gestionar los chats")
public class ChatController {
    
    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
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
    public Flux<ChatDTO> getChats() {
        return service.findAll();
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
    public Mono<ChatDTO> getChatsById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
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
    public Mono<ChatDTO> createChat(@Valid @RequestBody ChatDTO chatDTO) {
        return service.createChat(chatDTO);
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
    @PutMapping
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public Mono<ChatDTO> updateChat(@PathVariable @Min(1) Long id, @Valid @RequestBody ChatDTO chatDTO) {
        return service.updateChat(id, chatDTO);
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
    public Mono<Void> deleteChat(@PathVariable @Min(1) Long id) {
        return service.deleteChat(id);
    }
}
