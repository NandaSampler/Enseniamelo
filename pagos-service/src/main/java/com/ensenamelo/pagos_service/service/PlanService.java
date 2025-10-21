package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.PlanDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PlanService {
    Flux<PlanDTO> findAll();
    Mono<PlanDTO> findById(Long id);
}
