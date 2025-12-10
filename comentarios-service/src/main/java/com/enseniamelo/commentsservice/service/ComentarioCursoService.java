package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.repository.ComentarioCursoRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ComentarioCursoService {

    private final ComentarioCursoRepository repository;

    public ComentarioCursoService(ComentarioCursoRepository repository) {
        this.repository = repository;
    }

    // === OBTENER TODOS LOS COMENTARIOS ===
    public Flux<ComentarioCurso> getAllComentarios() {
        return repository.findAll();
    }

    // === OBTENER COMENTARIO POR ID ===
    public Mono<ComentarioCurso> getComentarioById(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)
                ));
    }

    // === OBTENER COMENTARIOS POR ID DEL CURSO ===
    public Flux<ComentarioCurso> getComentariosByCurso(String idCurso) {
        return repository.findByIdCurso(idCurso);
    }

    // === CREAR NUEVO COMENTARIO ===
    public Mono<ComentarioCurso> createComentario(ComentarioCurso comentario) {
        return repository.save(comentario);
    }

    // === ACTUALIZAR COMENTARIO EXISTENTE ===
    public Mono<ComentarioCurso> updateComentario(String id, ComentarioCurso updated) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)
                ))
                .flatMap(existing -> {
                    existing.setComentario(updated.getComentario());
                    existing.setClasificacion(updated.getClasificacion());
                    existing.setFecha(updated.getFecha());
                    return repository.save(existing);
                });
    }

    // === ELIMINAR COMENTARIO ===
    public Mono<Void> deleteComentario(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)
                ))
                .flatMap(existing -> repository.deleteById(id));
    }
}
