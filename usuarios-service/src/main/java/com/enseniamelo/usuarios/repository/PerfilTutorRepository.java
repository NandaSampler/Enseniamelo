package com.enseniamelo.usuarios.repository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.usuarios.model.PerfilTutor;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PerfilTutorRepository extends ReactiveMongoRepository<PerfilTutor, String> {
    Mono<PerfilTutor> findByIdTutor(Integer idTutor);
    Mono<Boolean> existsByIdTutor(Integer idTutor);
    Mono<PerfilTutor> findByIdUsuario(Integer idUsuario);
    Mono<Boolean> existsByIdUsuario(Integer idUsuario);
    Flux<PerfilTutor> findByVerificado(Boolean verificado);
    Flux<PerfilTutor> findByVerificadoAndClasificacionGreaterThanEqual(Boolean verificado, Float clasificacionMinima);
    Mono<Long> countByVerificado(Boolean verificado);
    Mono<Void> deleteByIdTutor(Integer idTutor);
}