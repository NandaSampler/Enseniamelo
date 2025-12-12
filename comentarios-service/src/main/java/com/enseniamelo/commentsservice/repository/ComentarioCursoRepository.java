package com.enseniamelo.commentsservice.repository;

import com.enseniamelo.commentsservice.model.ComentarioCurso;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.data.mongodb.repository.Query;
import reactor.core.publisher.Flux;

public interface ComentarioCursoRepository extends ReactiveMongoRepository<ComentarioCurso, String> {

    @Query("{ 'id_curso': ?0 }")
    Flux<ComentarioCurso> findByIdCurso(String id_curso);
}