package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Mensaje;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import reactor.core.publisher.Flux;

public interface MensajeRepository extends ReactiveMongoRepository<Mensaje, String> {
   @Query("{ 'id_chat': ?0 }")
    Flux<Mensaje> findByIdChat(ObjectId idChat);
}
