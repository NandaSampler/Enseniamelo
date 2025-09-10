package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.PlanDTO;
import com.ensenamelo.pagos_service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import lombok.Builder;


import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryPlanService implements PlanService {
    private final Map<Long, PlanDTO> data = new ConcurrentHashMap<>();
    public InMemoryPlanService() {
        data.put(1L, PlanDTO.builder().id(1L).nombre("Básico")
                .precio(new BigDecimal("29.99")).duracion(30).estado("ACTIVO").build());
        data.put(2L, PlanDTO.builder().id(2L).nombre("Premium")
                .precio(new BigDecimal("59.99")).duracion(30).estado("ACTIVO").build());
    }
    public Flux<PlanDTO> findAll() { return Flux.fromIterable(data.values()); }
    public Mono<PlanDTO> findById(Long id) {
        PlanDTO v = data.get(id);
        return v != null ? Mono.just(v) : Mono.error(new ResourceNotFoundException("Plan", id));
    }
}