package com.enseniamelo.commentsservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import com.enseniamelo.commentsservice.external.MsCursosIntegration;
import com.enseniamelo.commentsservice.external.MsUsuariosIntegration;
import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.repository.ComentarioCursoRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ComentarioCursoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ComentarioCursoService.class);
    
    private final ComentarioCursoRepository repository;
    private final MsUsuariosIntegration usuariosIntegration;
    private final MsCursosIntegration cursosIntegration;

    public ComentarioCursoService(
            ComentarioCursoRepository repository,
            MsUsuariosIntegration usuariosIntegration,
            MsCursosIntegration cursosIntegration) {
        this.repository = repository;
        this.usuariosIntegration = usuariosIntegration;
        this.cursosIntegration = cursosIntegration;
    }

    // === OBTENER TODOS LOS COMENTARIOS ===
    public Flux<ComentarioCurso> getAllComentarios() {
        LOGGER.info("Obteniendo todos los comentarios");
        return repository.findAll();
    }

    // === OBTENER COMENTARIO POR ID ===
    public Mono<ComentarioCurso> getComentarioById(String id) {
        LOGGER.info("Obteniendo comentario con id: {}", id);
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)));
    }

    // === OBTENER COMENTARIOS POR ID DEL CURSO ===
    public Flux<ComentarioCurso> getComentariosByCurso(String idCurso) {
        LOGGER.info("Obteniendo comentarios del curso: {}", idCurso);
        return repository.findByIdCurso(idCurso);
    }

    // === CREAR NUEVO COMENTARIO CON VALIDACIONES ===
    public Mono<ComentarioCurso> createComentario(ComentarioCurso comentario, String token) {
        LOGGER.info("Creando comentario para curso {} del usuario {}", 
                comentario.getId_curso(), comentario.getId_usuario());
        
        return usuariosIntegration.existeUsuario(comentario.getId_usuario(), token)
                .flatMap(existeUsuario -> {
                    if (!existeUsuario) {
                        LOGGER.error("Usuario no encontrado: {}", comentario.getId_usuario());
                        return Mono.error(new ResourceNotFoundException(
                                "Usuario no encontrado con id: " + comentario.getId_usuario()));
                    }
                    return cursosIntegration.existeCurso(comentario.getId_curso(), token)
                            .flatMap(existeCurso -> {
                                if (!existeCurso) {
                                    LOGGER.error("Curso no encontrado: {}", comentario.getId_curso());
                                    return Mono.error(new ResourceNotFoundException(
                                            "Curso no encontrado con id: " + comentario.getId_curso()));
                                }
                                
                                LOGGER.info("Validaciones exitosas, guardando comentario");
                                return repository.save(comentario)
                                        .doOnSuccess(saved -> LOGGER.info("Comentario creado con id: {}", 
                                                saved.getIdComentario()));
                            });
                });
    }

    // === ACTUALIZAR COMENTARIO EXISTENTE ===
    public Mono<ComentarioCurso> updateComentario(String id, ComentarioCurso updated) {
        LOGGER.info("Actualizando comentario con id: {}", id);
        
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)))
                .flatMap(existing -> {
                    existing.setComentario(updated.getComentario());
                    existing.setClasificacion(updated.getClasificacion());

                    if (updated.getActivo() != null) {
                        existing.setActivo(updated.getActivo());
                    }

                    return repository.save(existing)
                            .doOnSuccess(saved -> LOGGER.info("Comentario actualizado exitosamente"));
                });
    }

    // === ELIMINAR COMENTARIO ===
    public Mono<Void> deleteComentario(String id) {
        LOGGER.info("Eliminando comentario con id: {}", id);
        
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("No se encontró el comentario con ID: " + id)))
                .flatMap(existing -> repository.deleteById(id)
                        .doOnSuccess(v -> LOGGER.info("Comentario eliminado exitosamente")));
    }
    
    // === OBTENER COMENTARIOS DE UN USUARIO ===
    public Flux<ComentarioCurso> getComentariosByUsuario(String idUsuario) {
        LOGGER.info("Obteniendo comentarios del usuario: {}", idUsuario);
        return repository.findAll()
                .filter(comentario -> comentario.getId_usuario().equals(idUsuario));
    }
    
    // === CALCULAR PROMEDIO DE CLASIFICACIÓN DE UN CURSO ===
    public Mono<Double> getPromedioClasificacionCurso(String idCurso) {
        LOGGER.info("Calculando promedio de clasificación del curso: {}", idCurso);
        
        return repository.findByIdCurso(idCurso)
                .map(ComentarioCurso::getClasificacion)
                .collectList()
                .map(clasificaciones -> {
                    if (clasificaciones.isEmpty()) {
                        return 0.0;
                    }
                    double suma = clasificaciones.stream()
                            .mapToInt(Integer::intValue)
                            .sum();
                    return suma / clasificaciones.size();
                })
                .doOnSuccess(promedio -> LOGGER.info("Promedio calculado: {}", promedio));
    }
}