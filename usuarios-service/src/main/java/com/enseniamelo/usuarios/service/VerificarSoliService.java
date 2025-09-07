package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.VerificarSoliDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface VerificarSoliService {
    Flux<VerificarSoliDTO> findAll();
    Mono<VerificarSoliDTO> findById(Long id);
    Mono<VerificarSoliDTO> save(VerificarSoliDTO dto);
    Mono<VerificarSoliDTO> update(Long id, VerificarSoliDTO dto);
    Mono<Void> delete(Long id);
}
