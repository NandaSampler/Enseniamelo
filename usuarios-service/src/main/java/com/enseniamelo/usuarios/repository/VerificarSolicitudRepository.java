package com.enseniamelo.usuarios.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.usuarios.model.VerificarSolicitud;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface VerificarSolicitudRepository extends ReactiveMongoRepository<VerificarSolicitud, String> {
    Flux<VerificarSolicitud> findByIdUsuario(String idUsuario);
    Mono<VerificarSolicitud> findByIdCurso(String idCurso);
    Mono<Boolean> existsByIdCurso(String idCurso);
    Flux<VerificarSolicitud> findByEstado(String estado);
    Mono<Long> countByEstado(String estado);
    Flux<VerificarSolicitud> findByIdPerfilTutor(String idPerfilTutor);
}