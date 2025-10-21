package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.SuscripcionDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SuscripcionService {
    Flux<SuscripcionDTO> findAll();
    Mono<SuscripcionDTO> findById(Long id);
}