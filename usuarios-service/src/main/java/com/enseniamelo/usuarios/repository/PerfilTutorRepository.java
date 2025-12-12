package com.enseniamelo.usuarios.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.usuarios.model.PerfilTutor;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PerfilTutorRepository extends ReactiveMongoRepository<PerfilTutor, String> {

    Mono<PerfilTutor> findByIdUsuario(String idUsuario);

    Mono<Boolean> existsByIdUsuario(String idUsuario);

    Flux<PerfilTutor> findByVerificado(String verificado);

    Flux<PerfilTutor> findByVerificadoAndClasificacionGreaterThanEqual(String verificado, Float min);

    Mono<Long> countByVerificado(String verificado);

}
