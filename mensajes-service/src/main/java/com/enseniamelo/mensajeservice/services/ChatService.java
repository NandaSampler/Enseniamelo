package com.enseniamelo.mensajeservice.services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.mapper.ChatMapper;
import com.enseniamelo.mensajeservice.models.Chat;
import com.enseniamelo.mensajeservice.repository.ChatRepository;
import com.enseniamelo.mensajeservice.dto.ChatDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatMapper chatMapper;

    public Mono<ChatDTO> crearChat(ChatDTO chatDTO) {
        log.info("Creando un nuevo chat: {}", chatDTO);
        Chat chat = chatMapper.toEntity(chatDTO);
        chat.setFechaCreacion(LocalDate.now());
        return chatRepository.save(chat)
                .map(chatMapper::toDto)
                .doOnSuccess(savedChatDTO -> log.info("Chat creado exitosamente: {}", savedChatDTO))
                .doOnError(error -> log.error("Error al crear el chat: {}", error.getMessage()));
    }

    public Flux<ChatDTO> obtenerTodos() {
        log.info("Obteniendo todos los chats");
        return chatRepository.findAll()
                .map(chatMapper::toDto)
                .doOnError(error -> log.error("Error al obtener los chats: {}", error.getMessage()));
    }

    public Mono<ChatDTO> obtenerPorId(String id) {
        log.info("Obteniendo chat con ID: {}", id);
        return chatRepository.findById(id)
                .map(chatMapper::toDto)
                .doOnSuccess(chatDTO -> log.info("Chat obtenido exitosamente: {}", chatDTO))
                .doOnError(error -> log.error("Error al obtener el chat: {}", error.getMessage()));
    }

    public Mono<ChatDTO> actualizarChat(String id, ChatDTO chatDTO) {
        log.info("Actualizando chat con ID: {}", id);
        return chatRepository.findById(id)
                .flatMap(existingChat -> {
                    Chat updatedChat = chatMapper.toEntity(chatDTO);
                    updatedChat.setId(existingChat.getId());
                    updatedChat.setFechaCreacion(existingChat.getFechaCreacion());
                    return chatRepository.save(updatedChat);
                })
                .map(chatMapper::toDto)
                .doOnSuccess(updatedChatDTO -> log.info("Chat actualizado exitosamente: {}", updatedChatDTO))
                .doOnError(error -> log.error("Error al actualizar el chat: {}", error.getMessage()));
    }

    public Mono<Void> eliminarChat(String id) {
        log.info("Eliminando chat con ID: {}", id);
        return chatRepository.findById(id)
                .flatMap(existingChat -> chatRepository.delete(existingChat)
                .doOnSuccess(v -> log.info("Chat eliminado exitosamente con ID: {}", id)))
                .doOnError(error -> log.error("Error al eliminar el chat: {}", error.getMessage()));
    }
}
