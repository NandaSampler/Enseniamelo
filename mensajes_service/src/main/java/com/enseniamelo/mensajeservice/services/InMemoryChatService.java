package com.enseniamelo.mensajeservice.services;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.dto.ChatDTO;
import com.enseniamelo.mensajeservice.exceptions.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryChatService implements ChatService {
    
    private final Map<Long, ChatDTO> data = new ConcurrentHashMap<>();

    public InMemoryChatService() {
        data.put(1L, ChatDTO.builder()
                .id(1L).creado(System.currentTimeMillis()).cerrado(System.currentTimeMillis())
                .build());

        data.put(2L, ChatDTO.builder()
                .id(2L).creado(System.currentTimeMillis()).cerrado(System.currentTimeMillis())
                .build());
    }

    //Obtener todos los chats
    @Override
    public Flux<ChatDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    //Obtener un chat por ID
    @Override
    public Mono<ChatDTO> findById(Long id) {
        ChatDTO c = data.get(id);
        return (c != null)
                ? Mono.just(c)
                : Mono.error(new ResourceNotFoundException("Chat", id));
    }

    //Crear un nuevo chat
    @Override
    public Mono<ChatDTO> createChat(ChatDTO chatDTO) {
        long id = data.size() + 1L;
        chatDTO = ChatDTO.builder()
                .id(id)
                .creado(System.currentTimeMillis())
                .cerrado(System.currentTimeMillis())
                .build();
        data.put(id, chatDTO);
        return Mono.just(chatDTO);
    }

    //Actualizar un chat existente
    @Override
    public Mono<ChatDTO> updateChat(Long id, ChatDTO chatDTO) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Chat", id));
        }
        ChatDTO updated = ChatDTO.builder()
                .id(id)
                .creado(System.currentTimeMillis() - 10000)
                .cerrado(System.currentTimeMillis() + 10000)
                .build();
        data.put(id, updated);
        return Mono.just(updated);
    }

    //Eliminar un chat por ID
    @Override
    public Mono<Void> deleteChat(Long id) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Chat", id));
        }
        data.remove(id);
        return Mono.empty();
    }
}
