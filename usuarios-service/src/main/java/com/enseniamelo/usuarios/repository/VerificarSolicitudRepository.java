package com.enseniamelo.usuarios.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.usuarios.model.VerificarSolicitud;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface VerificarSolicitudRepository extends ReactiveMongoRepository<VerificarSolicitud, String> {

    Mono<VerificarSolicitud> findByIdUsuario(String idUsuario);

    Mono<Boolean> existsByIdUsuario(String idUsuario);

    Flux<VerificarSolicitud> findByEstado(String estado);

    Mono<Long> countByEstado(String estado);
}