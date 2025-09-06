package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.RolDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RolService {
    Flux<RolDTO> findAll();
    Mono<RolDTO> findById(Long id);
    Mono<RolDTO> save(RolDTO rol);
    Mono<RolDTO> update(Long id, RolDTO rol);
    Mono<Void> delete(Long id);
}
