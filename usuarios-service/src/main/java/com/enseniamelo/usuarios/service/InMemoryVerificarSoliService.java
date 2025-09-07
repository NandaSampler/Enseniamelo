package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.VerificarSoliDTO;
import com.enseniamelo.usuarios.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InMemoryVerificarSoliService implements VerificarSoliService {

    private final Map<Long, VerificarSoliDTO> data = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3);

    public InMemoryVerificarSoliService() {
        data.put(1L, new VerificarSoliDTO(1L, "APROBADO", "Solicitud aceptada sin observaciones"));
        data.put(2L, new VerificarSoliDTO(2L, "RECHAZADO", "Faltan documentos requeridos"));
        data.put(3L, new VerificarSoliDTO(3L, "PENDIENTE", "En revisión por el área correspondiente"));
    }

    @Override
    public Flux<VerificarSoliDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<VerificarSoliDTO> findById(Long id) {
        VerificarSoliDTO dto = data.get(id);
        return (dto != null)
                ? Mono.just(dto)
                : Mono.error(new ResourceNotFoundException("Verificación", id));
    }

    @Override
    public Mono<VerificarSoliDTO> save(VerificarSoliDTO dto) {
        long id = idGenerator.incrementAndGet();
        dto.setId(id);
        data.put(id, dto);
        return Mono.just(dto);
    }

    @Override
    public Mono<VerificarSoliDTO> update(Long id, VerificarSoliDTO dto) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Verificación", id));
        }
        dto.setId(id);
        data.put(id, dto);
        return Mono.just(dto);
    }

    @Override
    public Mono<Void> delete(Long id) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Verificación", id));
        }
        data.remove(id);
        return Mono.empty();
    }
}
