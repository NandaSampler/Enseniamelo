package com.ensenamelo.pagos_service.service;

import com.ensenamelo.pagos_service.dto.PagoDTO;
import com.ensenamelo.pagos_service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryPagoService implements PagoService {
    private final Map<Long, PagoDTO> data = new ConcurrentHashMap<>();
    public InMemoryPagoService() {
        data.put(1L, PagoDTO.builder()
                .id(1L).suscripcionId(1L).monto(new BigDecimal("29.99"))
                .metodo("CARD").estado("APROBADO")
                .createdAt(OffsetDateTime.now().minusDays(2)).build());
        data.put(2L, PagoDTO.builder()
                .id(2L).suscripcionId(2L).monto(new BigDecimal("59.99"))
                .metodo("CARD").estado("APROBADO")
                .createdAt(OffsetDateTime.now().minusDays(40)).build());
    }
    public Flux<PagoDTO> findAll() { return Flux.fromIterable(data.values()); }
    public Mono<PagoDTO> findById(Long id) {
        PagoDTO v = data.get(id);
        return v != null ? Mono.just(v) : Mono.error(new ResourceNotFoundException("Pago", id));
    }
}
