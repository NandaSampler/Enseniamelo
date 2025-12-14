package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.repository.ComentarioCursoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.time.LocalDateTime;

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
                service = new ComentarioCursoService(repository, null, null);
        }

        @Test
        void testCreateComentario() {
                ComentarioCurso comentario = ComentarioCurso.builder()
                                .idComentario("1")
                                .id_curso("CURSO001")
                                .id_usuario("USER001")
                                .comentario("Excelente curso")
                                .clasificacion(4) // Integer ahora
                                .fechaCreacion(LocalDateTime.now())
                                .activo(true)
                                .build();

                when(repository.save(any(ComentarioCurso.class))).thenReturn(Mono.just(comentario));

                StepVerifier.create(service.createComentario(comentario, null))
                                .expectNextMatches(c -> c.getId_curso().equals("CURSO001"))
                                .verifyComplete();

                verify(repository, times(1)).save(any(ComentarioCurso.class));
        }

        @Test
        void testUpdateComentario_Exists() {
                ComentarioCurso existente = ComentarioCurso.builder()
                                .idComentario("1")
                                .id_curso("CURSO001")
                                .id_usuario("USER001")
                                .comentario("Antiguo texto")
                                .clasificacion(4)
                                .fechaCreacion(LocalDateTime.now().minusDays(1))
                                .activo(true)
                                .build();

                ComentarioCurso actualizado = ComentarioCurso.builder()
                                .idComentario("1")
                                .id_curso("CURSO001")
                                .id_usuario("USER001")
                                .comentario("Nuevo comentario")
                                .clasificacion(5)
                                .fechaCreacion(existente.getFechaCreacion())
                                .activo(true)
                                .build();

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
                ComentarioCurso updated = ComentarioCurso.builder()
                                .idComentario("1")
                                .id_curso("CURSO001")
                                .id_usuario("USER001")
                                .comentario("Texto nuevo")
                                .clasificacion(5)
                                .fechaCreacion(LocalDateTime.now())
                                .activo(true)
                                .build();

                when(repository.findById(eq("999"))).thenReturn(Mono.empty());

                StepVerifier.create(service.updateComentario("999", updated))
                                .expectError(ResourceNotFoundException.class)
                                .verify();

                verify(repository, times(1)).findById("999");
        }
}
