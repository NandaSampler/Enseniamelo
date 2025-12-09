package com.enseniamelo.commentsservice.controller;

import com.enseniamelo.commentsservice.dto.ComentarioCursoDTO;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.service.ComentarioCursoService;
import com.enseniamelo.commentsservice.service.ComentarioCursoMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/comentario-curso")
@Tag(name = "Comentario Curso", description = "Operaciones CRUD para los comentarios de cursos")
public class ComentarioCursoController {

    private final ComentarioCursoService service;

    public ComentarioCursoController(ComentarioCursoService service) {
        this.service = service;
    }

    // === GET: Listar todos los comentarios ===
    @GetMapping
    @Operation(summary = "Listar todos los comentarios de cursos")
    public Flux<ComentarioCurso> getAll() {
        return service.getAllComentarios();
    }

    // === GET: Obtener comentario por ID ===
    @GetMapping("/{id}")
    @Operation(summary = "Obtener un comentario por su ID")
    public Mono<ComentarioCurso> getById(@PathVariable String id) {
        return service.getComentarioById(id);
    }

    // === GET: Listar comentarios por curso ===
    @GetMapping("/curso/{idCurso}")
    @Operation(summary = "Listar comentarios de un curso específico")
    public Flux<ComentarioCurso> getByCurso(@PathVariable String idCurso) {
        return service.getComentariosByCurso(idCurso);
    }

    // === POST: Crear un nuevo comentario (usa DTO) ===
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo comentario de curso")
    public Mono<ComentarioCurso> create(@Valid @RequestBody ComentarioCursoDTO dto) {
        ComentarioCurso comentario = ComentarioCursoMapper.toEntity(dto);
        return service.createComentario(comentario);
    }

    // === PUT: Actualizar comentario existente (usa DTO) ===
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un comentario de curso existente")
    public Mono<ComentarioCurso> update(@PathVariable String id, @Valid @RequestBody ComentarioCursoDTO dto) {
        ComentarioCurso comentario = ComentarioCursoMapper.toEntity(dto);
        return service.updateComentario(id, comentario);
    }

    // === DELETE: Eliminar comentario ===
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un comentario de curso")
    public Mono<Void> delete(@PathVariable String id) {
        return service.deleteComentario(id);
    }
}
