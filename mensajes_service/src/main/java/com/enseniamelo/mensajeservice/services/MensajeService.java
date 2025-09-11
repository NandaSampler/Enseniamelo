package com.enseniamelo.mensajeservice.services;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface  MensajeService {
    Flux<MensajeDTO> findAll();

    Mono<MensajeDTO> findById(Long id);

    Mono<MensajeDTO> createMensaje(MensajeDTO mensajeDTO);

    Mono<MensajeDTO> updateMensaje(Long id, MensajeDTO mensajeDTO);

    Mono<Void> deleteMensaje(Long id);
}
