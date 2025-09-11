package com.enseniamelo.commentsservice.controller;

import com.enseniamelo.commentsservice.dto.CommentDTO;
import com.enseniamelo.commentsservice.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/comments")
@Validated
public class CommentController {

    private final CommentService service;

    public CommentController(CommentService service) {
        this.service = service;
    }

    /**
     * Listar todos los comentarios, opcionalmente filtrando por courseId o tutorId.
     */
    @GetMapping
    public Flux<CommentDTO> findAll(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long tutorId) {
        return service.findAll(courseId, tutorId);
    }

    /**
     * Obtener un comentario por ID.
     */
    @GetMapping("/{id}")
    public Mono<CommentDTO> findById(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    /**
     * Crear un nuevo comentario.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<CommentDTO> create(@Valid @RequestBody CommentDTO commentDto) {
        return service.create(commentDto);
    }

    /**
     * Actualizar un comentario por ID (total o parcial).
     */
    @PutMapping("/{id}")
    public Mono<CommentDTO> update(@PathVariable("id") Long id, @Valid @RequestBody CommentDTO dto) {
        return service.update(id, dto);
    }

    /**
     * Eliminar un comentario por ID.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable("id") Long id) {
        return service.delete(id);
    }
}
