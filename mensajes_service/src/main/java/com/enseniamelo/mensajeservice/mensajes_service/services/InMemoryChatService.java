package com.enseniamelo.mensajeservice.mensajes_service.services;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.mensajes_service.dto.ChatDTO;
import com.enseniamelo.tutorservice.exception.ResourceNotFoundException;

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

    @Override
    public Flux<ChatDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<ChatDTO> findById(Long id) {
        ChatDTO c = data.get(id);
        return (c != null)
                ? Mono.just(c)
                : Mono.error(new ResourceNotFoundException("Chat", id));
    }
}
