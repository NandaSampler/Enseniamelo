package com.enseniamelo.usuarios.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.exception.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryUsuarioService implements UsuarioService {

    private final Map<Long, UsuarioDTO> data = new ConcurrentHashMap<>();

    public InMemoryUsuarioService() {
        data.put(1L, new UsuarioDTO(1L, "Juan Pérez", "juan.perez@email.com"));
        data.put(2L, new UsuarioDTO(2L, "María Gómez", "maria.gomez@email.com"));
        data.put(3L, new UsuarioDTO(3L, "Luis Torres", "luis.torres@email.com"));
    }

    @Override
    public Flux<UsuarioDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<UsuarioDTO> findById(Long id) {
        UsuarioDTO u = data.get(id);
        return (u != null)
                ? Mono.just(u)
                : Mono.error(new ResourceNotFoundException("Usuario", id));
    }
}
