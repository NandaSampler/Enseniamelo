package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Mensaje;

import reactor.core.publisher.Mono;

import java.util.List;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface MensajeRepository extends ReactiveMongoRepository<Mensaje, String> {
    List<Mensaje> findAllMensajesByContenido(String contenido, String idChat);
    Mono<Mensaje> editContenidoByIdMensaje(String contenido);
}
