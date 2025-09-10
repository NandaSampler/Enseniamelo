package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.PagoDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PagoService {
    Flux<PagoDTO> findAll();
    Mono<PagoDTO> findById(Long id);
}