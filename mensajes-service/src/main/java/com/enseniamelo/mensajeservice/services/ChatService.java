package com.enseniamelo.mensajeservice.services;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;
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
        ObjectId idCurso = new ObjectId(chatDTO.getIdCurso());
        List<ObjectId> participantes = chatDTO.getParticipantes()
                .stream()
                .map(ObjectId::new)
                .toList();

        return chatRepository
            .findByIdCursoAndParticipantesAll(idCurso, participantes)
            .flatMap(chatExistente -> {
                log.info("Chat ya existente: {}", chatExistente.getId());
                return Mono.just(chatExistente);
            })
            .switchIfEmpty(
                Mono.defer(() -> {
                    Chat nuevoChat = chatMapper.toEntity(chatDTO);
                    nuevoChat.setCreado(LocalDateTime.now());
                    nuevoChat.setActualizado(LocalDateTime.now());

                    log.info("Creando nuevo chat");
                    return chatRepository.save(nuevoChat);
                })
            )
            .map(chatMapper::toDto);
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
