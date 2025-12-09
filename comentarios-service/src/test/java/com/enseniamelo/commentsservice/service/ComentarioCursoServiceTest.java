package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.repository.ComentarioCursoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ComentarioCursoServiceTest {

    private ComentarioCursoRepository repository;
    private ComentarioCursoService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(ComentarioCursoRepository.class);
        service = new ComentarioCursoService(repository);
    }

    @Test
    void testCreateComentario() {
        ComentarioCurso comentario = new ComentarioCurso(
                "1", "CURSO001", "USER001",
                "Excelente curso", 4.8f,
                LocalDate.now().toString()
        );

        when(repository.save(any(ComentarioCurso.class))).thenReturn(Mono.just(comentario));

        StepVerifier.create(service.createComentario(comentario))
                .expectNextMatches(c -> c.getIdCurso().equals("CURSO001"))
                .verifyComplete();

        verify(repository, times(1)).save(any(ComentarioCurso.class));
    }

    @Test
    void testUpdateComentario_Exists() {
        ComentarioCurso existente = new ComentarioCurso(
                "1", "CURSO001", "USER001",
                "Antiguo texto", 4.0f,
                "2025-10-18"
        );

        ComentarioCurso actualizado = new ComentarioCurso(
                "1", "CURSO001", "USER001",
                "Nuevo comentario", 5.0f,
                "2025-10-19"
        );

        when(repository.findById("1")).thenReturn(Mono.just(existente));
        when(repository.save(any(ComentarioCurso.class))).thenReturn(Mono.just(actualizado));

        StepVerifier.create(service.updateComentario("1", actualizado))
                .expectNextMatches(c -> c.getComentario().equals("Nuevo comentario"))
                .verifyComplete();

        verify(repository, times(1)).findById("1");
        verify(repository, times(1)).save(any(ComentarioCurso.class));
    }

    @Test
    void testUpdateComentario_NotFound() {
        ComentarioCurso updated = new ComentarioCurso(
                "1", "CURSO001", "USER001",
                "Texto nuevo", 5.0f,
                "2025-10-19"
        );

        when(repository.findById(eq("999"))).thenReturn(Mono.empty());

        StepVerifier.create(service.updateComentario("999", updated))
                .expectError(ResourceNotFoundException.class)
                .verify();

        verify(repository, times(1)).findById("999");
    }
}
