package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Chat;

import reactor.core.publisher.Mono;

import java.util.Collection;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {
    Mono<Chat> findByIdCursoAndParticipantesContains(
        ObjectId idCurso,
        ObjectId participante
    );

    Mono<Chat> findByIdCursoAndParticipantesAll(
        ObjectId idCurso,
        Collection<ObjectId> participantes
    );
}
