package com.enseniamelo.commentsservice.controller;

import com.enseniamelo.commentsservice.dto.CommentDTO;
import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
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

    // List all comments (optionally filter by courseId or tutorId as query params)
    @GetMapping
    public Flux<CommentDTO> findAll(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long tutorId) {
        return service.findAll(courseId, tutorId);
    }

    // Get by id
    @GetMapping("/{id}")
    public Mono<CommentDTO> findById(@PathVariable("id") Long id) {
        return service.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Comment", id)));
    }

    // Create
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<CommentDTO> create(@Valid @RequestBody Mono<CommentDTO> commentDtoMono) {
        return commentDtoMono.flatMap(service::create);
    }

    // Delete
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable("id") Long id) {
        return service.delete(id);
    }

    // Update (partial/full)
    @PutMapping("/{id}")
    public Mono<CommentDTO> update(@PathVariable("id") Long id, @Valid @RequestBody Mono<CommentDTO> dtoMono) {
        return dtoMono.flatMap(dto -> service.update(id, dto));
    }
}
