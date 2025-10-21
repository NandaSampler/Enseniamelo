package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.SuscripcionDTO;
import com.ensenamelo.pagos_service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemorySuscripcionService implements SuscripcionService {
    private final Map<Long, SuscripcionDTO> data = new ConcurrentHashMap<>();
    public InMemorySuscripcionService() {
        data.put(1L, SuscripcionDTO.builder()
                .id(1L).userId("user-123").planId(1L)
                .inicio(OffsetDateTime.now().minusDays(2))
                .fin(OffsetDateTime.now().plusDays(28))
                .estado("ACTIVA").build());
        data.put(2L, SuscripcionDTO.builder()
                .id(2L).userId("user-456").planId(2L)
                .inicio(OffsetDateTime.now().minusDays(40))
                .fin(OffsetDateTime.now().minusDays(10))
                .estado("VENCIDA").build());
    }
    public Flux<SuscripcionDTO> findAll() { return Flux.fromIterable(data.values()); }
    public Mono<SuscripcionDTO> findById(Long id) {
        SuscripcionDTO v = data.get(id);
        return v != null ? Mono.just(v) : Mono.error(new ResourceNotFoundException("Suscripcion", id));
    }
}