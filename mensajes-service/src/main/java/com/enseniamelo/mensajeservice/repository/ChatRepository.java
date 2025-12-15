package com.enseniamelo.mensajeservice.repository;

import java.util.Collection;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.enseniamelo.mensajeservice.models.Chat;

import reactor.core.publisher.Mono;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {

    /**
     * Busca un chat por curso y que contenga a un participante.
     * Mongo: { id_curso: ObjectId(...), participantes: ObjectId(...) }
     */
    @Query("{ 'id_curso': ?0, 'participantes': ?1 }")
    Mono<Chat> findByIdCursoAndParticipantesContains(
            ObjectId idCurso,
            ObjectId participante);

    /**
     * Busca un chat por curso y que tenga exactamente (al menos) todos los
     * participantes (sin importar el orden).
     * Mongo: { id_curso: ObjectId(...), participantes: { $all: [ObjectId(...), ...]
     * } }
     */
    @Query("{ 'id_curso': ?0, 'participantes': { $all: ?1 } }")
    Mono<Chat> findByIdCursoAndParticipantesAll(
            ObjectId idCurso,
            Collection<ObjectId> participantes);
}
