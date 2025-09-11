package com.enseniamelo.mensajeservice.services;

import com.enseniamelo.mensajeservice.dto.ChatDTO;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface  ChatService {
    Flux<ChatDTO> findAll();

    Mono<ChatDTO> findById(Long id);

    Mono<ChatDTO> createChat(ChatDTO chatDTO);

    Mono<ChatDTO> updateChat(Long id, ChatDTO chatDTO);

    Mono<Void> deleteChat(Long id);
}
