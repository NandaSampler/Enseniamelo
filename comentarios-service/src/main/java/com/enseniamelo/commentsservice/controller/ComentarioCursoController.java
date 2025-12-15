package com.enseniamelo.commentsservice.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.enseniamelo.commentsservice.dto.ComentarioCursoDTO;
import com.enseniamelo.commentsservice.external.MsUsuariosIntegration;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.service.ComentarioCursoMapper;
import com.enseniamelo.commentsservice.service.ComentarioCursoService;
import com.enseniamelo.commentsservice.util.JwtHelper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/comentario-curso")
@Tag(name = "Comentario Curso", description = "Operaciones CRUD para los comentarios de cursos")
@SecurityRequirement(name = "bearerAuth")
public class ComentarioCursoController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ComentarioCursoController.class);
    
    private final ComentarioCursoService service;
    private final MsUsuariosIntegration usuariosIntegration;

    public ComentarioCursoController(
            ComentarioCursoService service,
            MsUsuariosIntegration usuariosIntegration) {
        this.service = service;
        this.usuariosIntegration = usuariosIntegration;
    }

    // ✅ GET PÚBLICOS (sin @PreAuthorize - cualquiera puede ver comentarios)
    
    @GetMapping
    @Operation(summary = "Listar todos los comentarios de cursos")
    public Flux<ComentarioCurso> getAll() {
        LOGGER.info("GET /api/comentario-curso - Obteniendo todos los comentarios");
        return service.getAllComentarios();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un comentario por su ID")
    public Mono<ComentarioCurso> getById(@PathVariable String id) {
        LOGGER.info("GET /api/comentario-curso/{} - Obteniendo comentario", id);
        return service.getComentarioById(id);
    }

    @GetMapping("/curso/{idCurso}")
    @Operation(summary = "Listar comentarios de un curso específico")
    public Flux<ComentarioCurso> getByCurso(@PathVariable String idCurso) {
        LOGGER.info("GET /api/comentario-curso/curso/{} - Obteniendo comentarios del curso", idCurso);
        return service.getComentariosByCurso(idCurso);
    }
    
    @GetMapping("/curso/{idCurso}/promedio")
    @Operation(summary = "Obtener promedio de clasificación de un curso")
    public Mono<Double> getPromedioClasificacion(@PathVariable String idCurso) {
        LOGGER.info("GET /api/comentario-curso/curso/{}/promedio", idCurso);
        return service.getPromedioClasificacionCurso(idCurso);
    }

    // ✅ ENDPOINTS PROTEGIDOS (requieren autenticación)
    
    @GetMapping("/usuario/{idUsuario}")
    @Operation(summary = "Listar comentarios de un usuario específico")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TUTOR')")
    public Flux<ComentarioCurso> getByUsuario(@PathVariable String idUsuario) {
        LOGGER.info("GET /api/comentario-curso/usuario/{} - Obteniendo comentarios del usuario", idUsuario);
        return service.getComentariosByUsuario(idUsuario);
    }
    
    @GetMapping("/mis-comentarios")
    @Operation(summary = "Listar mis comentarios (usuario autenticado)")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TUTOR')")
    public Mono<Flux<ComentarioCurso>> getMisComentarios() {
        LOGGER.info("GET /api/comentario-curso/mis-comentarios");
        
        return JwtHelper.extraerToken()
                .flatMap(token -> usuariosIntegration.obtenerUsuarioActual(token)
                        .map(usuario -> {
                            LOGGER.info("Obteniendo comentarios del usuario: {}", usuario.getId());
                            return service.getComentariosByUsuario(usuario.getId());
                        }));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo comentario de curso")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TUTOR')")
    public Mono<ComentarioCurso> create(@Valid @RequestBody ComentarioCursoDTO dto) {
        LOGGER.info("POST /api/comentario-curso - Creando nuevo comentario");
        
        return JwtHelper.extraerToken()
                .flatMap(token -> {
                    return usuariosIntegration.obtenerUsuarioActual(token)
                            .flatMap(usuario -> {
                                LOGGER.info("Usuario autenticado: {} ({})", usuario.getNombre(), usuario.getId());
                                
                                ComentarioCurso comentario = ComentarioCurso.builder()
                                        .id_usuario(usuario.getId())  
                                        .id_curso(dto.getId_curso())
                                        .comentario(dto.getComentario())
                                        .clasificacion(dto.getClasificacion())
                                        .fechaCreacion(java.time.LocalDateTime.now())
                                        .activo(true)
                                        .build();
                                
                                return service.createComentario(comentario, token);
                            });
                });
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un comentario de curso existente")
    @PreAuthorize("hasRole('ADMIN') or @comentarioSecurityService.esComentarioDelUsuario(#id)")
    public Mono<ComentarioCurso> update(
            @PathVariable String id, 
            @Valid @RequestBody ComentarioCursoDTO dto) {
        LOGGER.info("PUT /api/comentario-curso/{} - Actualizando comentario", id);
        
        ComentarioCurso comentario = ComentarioCursoMapper.toEntity(dto);
        return service.updateComentario(id, comentario);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un comentario de curso")
    @PreAuthorize("hasRole('ADMIN') or @comentarioSecurityService.esComentarioDelUsuario(#id)")
    public Mono<Void> delete(@PathVariable String id) {
        LOGGER.info("DELETE /api/comentario-curso/{} - Eliminando comentario", id);
        return service.deleteComentario(id);
    }
}