package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UsuarioService {
    Flux<UsuarioDTO> findAll();

    Mono<UsuarioDTO> findById(Long id);
}