package com.enseniamelo.usuarios.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.RolDTO;
import com.enseniamelo.usuarios.exception.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryRolService implements RolService {

    private final Map<Long, RolDTO> data = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3); // empieza desde 3 para simular datos iniciales

    public InMemoryRolService() {
        data.put(1L, new RolDTO(1L, "ADMIN_USER", "ADMIN_TUTOR"));
        data.put(2L, new RolDTO(2L, "BASIC_USER", "TUTOR_ROLE"));
        data.put(3L, new RolDTO(3L, "GUEST_USER", "GUEST_TUTOR"));
    }

    @Override
    public Flux<RolDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<RolDTO> findById(Long id) {
        RolDTO r = data.get(id);
        return (r != null)
                ? Mono.just(r)
                : Mono.error(new ResourceNotFoundException("Rol", id));
    }

    @Override
    public Mono<RolDTO> save(RolDTO rol) {
        long id = idGenerator.incrementAndGet();
        rol.setId(id);
        data.put(id, rol);
        return Mono.just(rol);
    }

    @Override
    public Mono<RolDTO> update(Long id, RolDTO rol) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Rol", id));
        }
        rol.setId(id);
        data.put(id, rol);
        return Mono.just(rol);
    }

    @Override
    public Mono<Void> delete(Long id) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Rol", id));
        }
        data.remove(id);
        return Mono.empty();
    }
}
