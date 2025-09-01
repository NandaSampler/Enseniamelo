package com.enseniamelo.usuarios.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.exception.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryUsuarioService implements UsuarioService {

    private final Map<Long, UsuarioDTO> data = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3); 

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

    @Override
    public Mono<UsuarioDTO> save(UsuarioDTO usuario) {
        long id = idGenerator.incrementAndGet();
        usuario.setId(id);
        data.put(id, usuario);
        return Mono.just(usuario);
    }

    @Override
    public Mono<UsuarioDTO> update(Long id, UsuarioDTO usuario) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Usuario", id));
        }
        usuario.setId(id);
        data.put(id, usuario);
        return Mono.just(usuario);
    }

    @Override
    public Mono<Void> delete(Long id) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Usuario", id));
        }
        data.remove(id);
        return Mono.empty();
    }
}
