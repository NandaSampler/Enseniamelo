package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.CursoDTO;
import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.external.MsCursoIntegration;
import com.enseniamelo.usuarios.mapper.PerfilTutorMapper;
import com.enseniamelo.usuarios.mapper.UsuarioMapper;
import com.enseniamelo.usuarios.mapper.VerificarSolicitudMapper;
import com.enseniamelo.usuarios.model.VerificarSolicitud;
import com.enseniamelo.usuarios.repository.PerfilTutorRepository;
import com.enseniamelo.usuarios.repository.UsuarioRepository;
import com.enseniamelo.usuarios.repository.VerificarSolicitudRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificarSolicitudService {

    private final VerificarSolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilTutorRepository perfilTutorRepository;
    private final VerificarSolicitudMapper solicitudMapper;
    private final UsuarioMapper usuarioMapper;
    private final PerfilTutorMapper perfilTutorMapper;
    private final MsCursoIntegration cursoIntegration;

    /**
     * Crea solicitud para un curso - llamado por curso-service
     */
    public Mono<VerificarSolicitudDTO> crearSolicitudParaCurso(
            String idUsuario,
            String idPerfilTutor,
            String idCurso,
            VerificarSolicitudDTO solicitudDTO) {

        log.info("Creando solicitud de verificación para curso: {} del tutor: {}", idCurso, idPerfilTutor);
        
        return usuarioRepository.existsById(idUsuario)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Usuario no encontrado con id: {}", idUsuario);
                        return Mono.error(new RuntimeException("Usuario no encontrado con id: " + idUsuario));
                    }
                    
                    return solicitudRepository.existsByIdCurso(idCurso)
                            .flatMap(tieneSolicitud -> {
                                if (tieneSolicitud) {
                                    log.error("El curso {} ya tiene una solicitud de verificación", idCurso);
                                    return Mono.error(new RuntimeException(
                                            "El curso ya tiene una solicitud de verificación"));
                                }

                                VerificarSolicitud solicitud = new VerificarSolicitud();
                                solicitud.setId(null);
                                solicitud.setEstado("PENDIENTE");
                                solicitud.setIdUsuario(idUsuario);
                                solicitud.setIdPerfilTutor(idPerfilTutor);
                                solicitud.setIdCurso(idCurso);
                                solicitud.setFotoCi(solicitudDTO.getFotoCi());
                                solicitud.setComentario(solicitudDTO.getComentario());
                                solicitud.setArchivos(
                                        solicitudDTO.getArchivos() != null ? solicitudDTO.getArchivos()
                                                : java.util.List.of());

                                LocalDateTime ahora = LocalDateTime.now();
                                solicitud.setCreado(ahora);
                                solicitud.setActualizado(ahora);

                                return solicitudRepository.save(solicitud);
                            });
                })
                .map(guardada -> {
                    log.info("Solicitud creada exitosamente con id: {} para curso: {}", guardada.getId(), idCurso);
                    return solicitudMapper.entityToDto(guardada);
                });
    }

    /**
     * Obtiene todas las solicitudes con información completa (usuario, tutor y curso)
     * Para el panel de administración
     */
    public Flux<VerificarSolicitudCompleta> obtenerTodasCompletas() {
        log.info("Obteniendo todas las solicitudes con información completa");
        
        return solicitudRepository.findAll()
                .flatMap(this::enrichSolicitud)
                .doOnComplete(() -> log.info("Listado completo de solicitudes completado"));
    }

    /**
     * Busca solicitud por ID con información completa
     */
    public Mono<VerificarSolicitudCompleta> buscarPorIdCompleta(String id) {
        log.info("Buscando solicitud completa con id: {}", id);
        
        return solicitudRepository.findById(id)
                .flatMap(this::enrichSolicitud)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Solicitud no encontrada con id: {}", id);
                    return Mono.error(new RuntimeException("Solicitud no encontrada con id: " + id));
                }));
    }

    /**
     * Enriquece una solicitud con información de usuario, tutor y curso
     * El curso es OPCIONAL - si no se puede obtener, se devuelve un DTO vacío
     */
    private Mono<VerificarSolicitudCompleta> enrichSolicitud(VerificarSolicitud solicitud) {
        Mono<UsuarioDTO> usuarioMono = usuarioRepository.findById(solicitud.getIdUsuario())
                .map(usuarioMapper::entityToDto)
                .doOnError(error -> log.warn("Error obteniendo usuario {}: {}", 
                        solicitud.getIdUsuario(), error.getMessage()))
                .onErrorReturn(new UsuarioDTO());

        Mono<PerfilTutorDTO> tutorMono = perfilTutorRepository.findById(solicitud.getIdPerfilTutor())
                .map(perfilTutorMapper::entityToDto)
                .doOnError(error -> log.warn("Error obteniendo tutor {}: {}", 
                        solicitud.getIdPerfilTutor(), error.getMessage()))
                .onErrorReturn(new PerfilTutorDTO());

        // IMPORTANTE: El curso es opcional - si falla, devolvemos un DTO vacío
        Mono<CursoDTO> cursoMono = cursoIntegration.getCurso(solicitud.getIdCurso())
                .doOnError(error -> log.warn("No se pudo obtener información del curso {}: {}. " +
                        "Esto es normal si el servicio de cursos no tiene el endpoint implementado.", 
                        solicitud.getIdCurso(), error.getMessage()))
                .onErrorResume(error -> {
                    // Crear un DTO básico con la información que tenemos
                    CursoDTO cursoBasico = new CursoDTO();
                    cursoBasico.setId(solicitud.getIdCurso());
                    cursoBasico.setNombre("Curso - ID: " + solicitud.getIdCurso());
                    cursoBasico.setEstadoVerificacion(solicitud.getEstado());
                    return Mono.just(cursoBasico);
                });

        return Mono.zip(usuarioMono, tutorMono, cursoMono)
                .map(tuple -> {
                    VerificarSolicitudDTO solicitudDTO = solicitudMapper.entityToDto(solicitud);
                    return new VerificarSolicitudCompleta(
                            solicitudDTO,
                            tuple.getT1(), // usuario
                            tuple.getT2(), // tutor
                            tuple.getT3()  // curso (puede estar vacío)
                    );
                });
    }

    /**
     * Aprueba una solicitud y notifica al servicio de cursos
     */
    public Mono<VerificarSolicitudDTO> aprobarSolicitud(String id, String comentario) {
        log.info("Aprobando solicitud: {}", id);

        return solicitudRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Solicitud no encontrada")))
                .flatMap(solicitud -> {
                    if (!"PENDIENTE".equals(solicitud.getEstado())) {
                        return Mono.error(new RuntimeException("La solicitud ya fue procesada"));
                    }

                    LocalDateTime ahora = LocalDateTime.now();
                    solicitud.setEstado("APROBADO");
                    solicitud.setComentario(comentario);
                    solicitud.setDecidido(ahora);
                    solicitud.setActualizado(ahora);

                    return solicitudRepository.save(solicitud)
                            .flatMap(guardada -> {
                                // Intentar actualizar estado en curso-service (opcional)
                                return cursoIntegration.updateCursoVerificacion(
                                        guardada.getIdCurso(), "APROBADO")
                                        .doOnError(error -> log.warn("No se pudo notificar al servicio de cursos: {}. " +
                                                "Esto no afecta la aprobación de la solicitud.", error.getMessage()))
                                        .onErrorResume(error -> Mono.empty()) // Continuar aunque falle
                                        .thenReturn(guardada);
                            })
                            .flatMap(guardada -> {
                                // Actualizar perfil de tutor a "verificado"
                                return perfilTutorRepository.findById(guardada.getIdPerfilTutor())
                                        .flatMap(perfil -> {
                                            perfil.setVerificado("verificado");
                                            perfil.setActualizado(ahora);
                                            return perfilTutorRepository.save(perfil);
                                        })
                                        .doOnError(error -> log.error("Error actualizando perfil de tutor: {}", 
                                                error.getMessage()))
                                        .onErrorResume(error -> Mono.empty()) // Continuar aunque falle
                                        .thenReturn(guardada);
                            });
                })
                .map(guardada -> {
                    log.info("Solicitud aprobada exitosamente para curso: {}", guardada.getIdCurso());
                    return solicitudMapper.entityToDto(guardada);
                });
    }

    /**
     * Rechaza una solicitud y notifica al servicio de cursos
     */
    public Mono<VerificarSolicitudDTO> rechazarSolicitud(String id, String comentario) {
        log.info("Rechazando solicitud: {}", id);

        return solicitudRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Solicitud no encontrada")))
                .flatMap(solicitud -> {
                    if (!"PENDIENTE".equals(solicitud.getEstado())) {
                        return Mono.error(new RuntimeException("La solicitud ya fue procesada"));
                    }

                    solicitud.setEstado("RECHAZADO");
                    solicitud.setComentario(comentario);
                    LocalDateTime ahora = LocalDateTime.now();
                    solicitud.setDecidido(ahora);
                    solicitud.setActualizado(ahora);

                    return solicitudRepository.save(solicitud)
                            .flatMap(guardada -> {
                                // Intentar notificar a curso-service (opcional)
                                return cursoIntegration.updateCursoVerificacion(
                                        guardada.getIdCurso(), "RECHAZADO")
                                        .doOnError(error -> log.warn("No se pudo notificar al servicio de cursos: {}",
                                                error.getMessage()))
                                        .onErrorResume(error -> Mono.empty()) // Continuar aunque falle
                                        .thenReturn(guardada);
                            });
                })
                .map(guardada -> {
                    log.info("Solicitud rechazada para curso: {}", guardada.getIdCurso());
                    return solicitudMapper.entityToDto(guardada);
                });
    }

    // Métodos originales sin cambios
    public Mono<VerificarSolicitudDTO> buscarPorCurso(String idCurso) {
        log.info("Buscando solicitud del curso: {}", idCurso);
        return solicitudRepository.findByIdCurso(idCurso)
                .map(solicitudMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("No se encontró solicitud para el curso: {}", idCurso);
                    return Mono.error(new RuntimeException("No se encontró solicitud para el curso: " + idCurso));
                }));
    }

    public Flux<VerificarSolicitudDTO> buscarPorUsuario(String idUsuario) {
        log.info("Buscando solicitudes del usuario: {}", idUsuario);
        return solicitudRepository.findByIdUsuario(idUsuario)
                .map(solicitudMapper::entityToDto);
    }

    public Flux<VerificarSolicitudDTO> buscarPorTutor(String idPerfilTutor) {
        log.info("Buscando solicitudes del tutor: {}", idPerfilTutor);
        return solicitudRepository.findByIdPerfilTutor(idPerfilTutor)
                .map(solicitudMapper::entityToDto);
    }

    public Flux<VerificarSolicitudDTO> obtenerTodas() {
        log.info("Obteniendo todas las solicitudes");
        return solicitudRepository.findAll()
                .map(solicitudMapper::entityToDto)
                .doOnComplete(() -> log.info("Listado de solicitudes completado"));
    }

    public Mono<VerificarSolicitudDTO> buscarPorId(String id) {
        log.info("Buscando solicitud con id: {}", id);
        return solicitudRepository.findById(id)
                .map(solicitudMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Solicitud no encontrada con id: {}", id);
                    return Mono.error(new RuntimeException("Solicitud no encontrada con id: " + id));
                }));
    }

    public Flux<VerificarSolicitudDTO> obtenerPorEstado(String estado) {
        log.info("Obteniendo solicitudes con estado: {}", estado);
        return solicitudRepository.findByEstado(estado)
                .map(solicitudMapper::entityToDto)
                .doOnComplete(() -> log.info("Búsqueda por estado completada"));
    }

    public Mono<Void> eliminarSolicitud(String id) {
        log.info("Eliminando solicitud: {}", id);
        return solicitudRepository.existsById(id)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Solicitud no encontrada con id: {}", id);
                        return Mono.error(new RuntimeException("Solicitud no encontrada"));
                    }
                    return solicitudRepository.deleteById(id)
                            .doOnSuccess(v -> log.info("Solicitud eliminada exitosamente"));
                });
    }

    public Mono<VerificarSolicitudDTO> crearSolicitud(VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud desde evento");
        String idUsuario = solicitudDTO.getIdUsuario();
        String idCurso = solicitudDTO.getIdCurso();
        String idPerfilTutor = solicitudDTO.getIdPerfilTutor();

        if (idUsuario == null || idCurso == null) {
            return Mono.error(new RuntimeException("idUsuario e idCurso son obligatorios"));
        }

        return crearSolicitudParaCurso(idUsuario, idPerfilTutor, idCurso, solicitudDTO);
    }

    /**
     * Clase interna para solicitud completa con toda la información
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class VerificarSolicitudCompleta {
        private VerificarSolicitudDTO solicitud;
        private UsuarioDTO usuario;
        private PerfilTutorDTO tutor;
        private CursoDTO curso;
    }
}