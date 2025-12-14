package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
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
                                if (solicitudDTO.getArchivos() != null && !solicitudDTO.getArchivos().isEmpty()) {
                                    solicitud.setArchivos(solicitudDTO.getArchivos());
                                } else {
                                    solicitud.setArchivos(java.util.List.of());
                                }

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

                    return solicitudRepository.save(solicitud);
                })
                .map(solicitudGuardada -> {
                    log.info("Solicitud aprobada para curso: {}", solicitudGuardada.getIdCurso());
                    return solicitudMapper.entityToDto(solicitudGuardada);
                });
    }

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

                    return solicitudRepository.save(solicitud);
                })
                .map(guardada -> {
                    log.info("Solicitud rechazada para curso: {}", guardada.getIdCurso());
                    return solicitudMapper.entityToDto(guardada);
                });
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
}