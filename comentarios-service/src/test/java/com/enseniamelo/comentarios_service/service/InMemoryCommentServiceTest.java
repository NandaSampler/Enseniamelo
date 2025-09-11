package com.enseniamelo.comentarios_service.service;

import com.enseniamelo.commentsservice.dto.CommentDTO;
import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import com.enseniamelo.commentsservice.service.InMemoryCommentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

class InMemoryCommentServiceTest {

    private InMemoryCommentService service;

    @BeforeEach
    void setUp() {
        service = new InMemoryCommentService();
    }

    @Test
    void createAndFindById_ShouldReturnSavedComment() {
        CommentDTO dto = new CommentDTO();
        dto.setComentario("Excelente curso!");
        dto.setCalificacion(5.0f);
        dto.setCourseId(1L);
        dto.setTutorId(2L);
        dto.setUserId(3L);
        dto.setCreadoEn(LocalDateTime.now());

        StepVerifier.create(service.create(dto)
                        .flatMap(saved -> service.findById(saved.getId())))
                .expectNextMatches(found ->
                        found.getComentario().equals("Excelente curso!") &&
                        found.getCalificacion() == 5 &&
                        found.getCourseId() == 1L
                )
                .verifyComplete();
    }

    @Test
    void findById_NonExistent_ShouldError() {
        StepVerifier.create(service.findById(999L))
                .expectError(ResourceNotFoundException.class)
                .verify();
    }

    @Test
    void delete_ShouldRemoveComment() {
        CommentDTO dto = new CommentDTO();
        dto.setComentario("Comentario a eliminar");
        dto.setCalificacion(4.0f);
        dto.setCourseId(10L);
        dto.setTutorId(20L);
        dto.setUserId(30L);
        dto.setCreadoEn(LocalDateTime.now());

        StepVerifier.create(service.create(dto)
                        .flatMap(saved -> service.delete(saved.getId())
                                .then(service.findById(saved.getId()))))
                .expectError(ResourceNotFoundException.class)
                .verify();
    }
}
