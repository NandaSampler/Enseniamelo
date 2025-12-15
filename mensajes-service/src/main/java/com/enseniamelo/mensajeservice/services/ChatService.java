package com.enseniamelo.mensajeservice.services;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.dto.ChatDTO;
import com.enseniamelo.mensajeservice.mapper.ChatMapper;
import com.enseniamelo.mensajeservice.models.Chat;
import com.enseniamelo.mensajeservice.repository.ChatRepository;

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
        return Mono.defer(() -> {
            // ✅ Validación / parseo seguro de ObjectId
            final ObjectId idCurso;
            try {
                idCurso = new ObjectId(chatDTO.getId_curso());
            } catch (Exception e) {
                return Mono.error(new IllegalArgumentException("id_curso inválido: " + chatDTO.getId_curso()));
            }

            final List<ObjectId> participantes;
            try {
                participantes = chatDTO.getParticipantes()
                        .stream()
                        .map(ObjectId::new)
                        .toList();
            } catch (Exception e) {
                return Mono.error(new IllegalArgumentException("participantes contiene un ObjectId inválido"));
            }

            if (participantes == null || participantes.isEmpty()) {
                return Mono.error(new IllegalArgumentException("El campo 'participantes' no puede estar vacío"));
            }

            return chatRepository
                    // ✅ Usa @Query ($all) => no rompe Spring Data
                    .findByIdCursoAndParticipantesAll(idCurso, participantes)
                    .doOnNext(chatExistente -> log.info("Chat ya existente: {}", chatExistente.getId()))
                    .switchIfEmpty(Mono.defer(() -> {
                        Chat nuevoChat = chatMapper.toEntity(chatDTO);

                        // ✅ timestamps
                        nuevoChat.setCreado(LocalDateTime.now());
                        nuevoChat.setActualizado(LocalDateTime.now());

                        log.info("Creando nuevo chat (curso={}, participantes={})",
                                chatDTO.getId_curso(), chatDTO.getParticipantes());

                        return chatRepository.save(nuevoChat);
                    }))
                    .map(chatMapper::toDto);
        });
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
                .switchIfEmpty(Mono.error(new RuntimeException("Chat no encontrado con ID: " + id)))
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
                .switchIfEmpty(Mono.error(new RuntimeException("Chat no encontrado con ID: " + id)))
                .flatMap(chatRepository::delete)
                .doOnSuccess(v -> log.info("Chat eliminado con ID {}", id))
                .doOnError(err -> log.error("Error al eliminar chat: {}", err.getMessage()));
    }
}
