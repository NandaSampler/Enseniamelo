package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Chat;

import reactor.core.publisher.Mono;

import java.util.Collection;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {
    Mono<Chat> findByIdCursoAndParticipantesContaining(
        ObjectId idCurso,
        ObjectId participante
    );

    @Query("{ 'id_curso': ?0, 'participantes': { $all: ?1 } }")
    Mono<Chat> findByIdCursoAndParticipantesAll(
        ObjectId idCurso,
        Collection<ObjectId> participantes
    );
}
