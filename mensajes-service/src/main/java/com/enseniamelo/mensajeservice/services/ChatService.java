package com.enseniamelo.mensajeservice.services;

import java.time.LocalDateTime;

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
        chat.setCreado(LocalDateTime.now());
        chat.setActualizado(LocalDateTime.now());

        return chatRepository.save(chat)
            .map(chatMapper::toDto)
            .doOnSuccess(c -> log.info("Chat creado exitosamente: {}", c))
            .doOnError(err -> log.error("Error al crear chat: {}", err.getMessage()));
    }

    public Flux<ChatDTO> obtenerTodos() {
        return chatRepository.findAll()
            .map(chatMapper::toDto)
            .doOnError(err -> log.error("Error al obtener chats: {}", err.getMessage()));
    }

    public Mono<ChatDTO> obtenerPorId(String id) {
        return chatRepository.findById(id)
            .map(chatMapper::toDto)
            .doOnError(err -> log.error("Error al obtener chat: {}", err.getMessage()));
    }

    public Mono<ChatDTO> actualizarChat(String id, ChatDTO chatDTO) {
        return chatRepository.findById(id)
            .flatMap(existing -> {
                chatMapper.updateEntityFromDto(chatDTO, existing);
                existing.setActualizado(LocalDateTime.now());
                return chatRepository.save(existing);
            })
            .map(chatMapper::toDto)
            .doOnError(err -> log.error("Error al actualizar chat: {}", err.getMessage()));
    }

    public Mono<Void> eliminarChat(String id) {
        return chatRepository.findById(id)
            .flatMap(chatRepository::delete)
            .doOnSuccess(v -> log.info("Chat eliminado con ID {}", id))
            .doOnError(err -> log.error("Error al eliminar chat: {}", err.getMessage()));
    }
}
