package com.enseniamelo.usuarios.repository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.usuarios.model.Usuario;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UsuarioRepository extends ReactiveMongoRepository<Usuario, String> {
    Mono<Usuario> findByIdUsuario(Integer idUsuario);
    Mono<Boolean> existsByIdUsuario(Integer idUsuario);
    Mono<Usuario> findByEmail(String email);
    Mono<Boolean> existsByEmail(String email);
    Mono<Void> deleteByIdUsuario(Integer idUsuario);
    Flux<Usuario> findByRol(String rol);
    Mono<Long> countByRol(String rol);
}