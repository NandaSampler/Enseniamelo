package com.enseniamelo.commentsservice.repository;

import com.enseniamelo.commentsservice.model.ComentarioCurso;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface ComentarioCursoRepository extends ReactiveMongoRepository<ComentarioCurso, String> {
    Flux<ComentarioCurso> findByIdCurso(String idCurso);
}
