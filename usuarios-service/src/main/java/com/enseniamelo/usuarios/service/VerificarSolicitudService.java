package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.mapper.VerificarSolicitudMapper;
import com.enseniamelo.usuarios.model.PerfilTutor;
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
    private final SequenceGeneratorService sequenceGenerator;

    public Mono<VerificarSolicitudDTO> crearSolicitud(Integer idUsuario, VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud de verificación para usuario: {}", idUsuario);

        return usuarioRepository.existsByIdUsuario(idUsuario)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                        return Mono.error(new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
                    }
                    return solicitudRepository.existsByIdUsuario(idUsuario)
                            .flatMap(tieneSolicitud -> {
                                if (tieneSolicitud) {
                                    log.error("El usuario {} ya tiene una solicitud", idUsuario);
                                    return Mono.error(
                                            new RuntimeException("El usuario ya tiene una solicitud de verificación"));
                                }
                                return sequenceGenerator.generateSequence("verificar_solicitud_sequence")
                                        .flatMap(idVerificar -> {
                                            VerificarSolicitud solicitud = new VerificarSolicitud();
                                            solicitud.setIdVerificar(idVerificar);
                                            solicitud.setEstado("PENDIENTE");
                                            solicitud.setFotoCi(solicitudDTO.getFotoCi());
                                            solicitud.setIdUsuario(idUsuario);
                                            LocalDateTime ahora = LocalDateTime.now();
                                            solicitud.setCreado(ahora);
                                            solicitud.setActualizado(ahora);
                                            return solicitudRepository.save(solicitud)
                                                    .flatMap(guardada -> {
                                                        return usuarioRepository.findByIdUsuario(idUsuario)
                                                                .flatMap(usuario -> {
                                                                    usuario.setIdVerificarSolicitud(
                                                                            guardada.getIdVerificar());
                                                                    return usuarioRepository.save(usuario);
                                                                })
                                                                .thenReturn(guardada);
                                                    });
                                        });
                            });
                })
                .map(guardada -> {
                    log.info("Solicitud creada exitosamente con id: {}", guardada.getIdVerificar());
                    return solicitudMapper.entityToDto(guardada);
                });
    }
    public Mono<VerificarSolicitudDTO> crearSolicitud(VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud desde evento");

        Integer idUsuario = solicitudDTO.getIdUsuario();

        if (idUsuario == null) {
            return Mono.error(new RuntimeException("El idUsuario es obligatorio en el DTO"));
        }
        return crearSolicitud(idUsuario, solicitudDTO);
    }

    public Mono<Void> procesarVerificacion(Integer idVerificar) {
        log.info("Procesando verificación de solicitud: {}", idVerificar);

        return solicitudRepository.findByIdVerificar(idVerificar)
                .switchIfEmpty(Mono.error(new RuntimeException("Solicitud no encontrada con id: " + idVerificar)))
                .flatMap(solicitud -> {
                    if (!"PENDIENTE".equals(solicitud.getEstado())) {
                        log.warn("La solicitud {} ya fue procesada. Estado actual: {}", idVerificar,
                                solicitud.getEstado());
                        return Mono.empty();
                    }
                    log.info("Solicitud {} lista para ser aprobada o rechazada", idVerificar);
                    return Mono.empty();
                })
                .then();
    }

    public Flux<VerificarSolicitudDTO> obtenerTodas() {
        log.info("Obteniendo todas las solicitudes");
        return solicitudRepository.findAll()
                .map(solicitudMapper::entityToDto)
                .doOnComplete(() -> log.info("Listado de solicitudes completado"));
    }

    public Mono<VerificarSolicitudDTO> buscarPorId(Integer idVerificar) {
        log.info("Buscando solicitud con id: {}", idVerificar);
        return solicitudRepository.findByIdVerificar(idVerificar)
                .map(solicitudMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Solicitud no encontrada con id: {}", idVerificar);
                    return Mono.error(new RuntimeException("Solicitud no encontrada con id: " + idVerificar));
                }));
    }

    public Mono<VerificarSolicitudDTO> buscarPorUsuario(Integer idUsuario) {
        log.info("Buscando solicitud del usuario: {}", idUsuario);

        return solicitudRepository.findByIdUsuario(idUsuario)
                .map(solicitudMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("No se encontró solicitud para el usuario: {}", idUsuario);
                    return Mono.error(new RuntimeException("No se encontró solicitud para el usuario: " + idUsuario));
                }));
    }

    public Flux<VerificarSolicitudDTO> obtenerPorEstado(String estado) {
        log.info("Obteniendo solicitudes con estado: {}", estado);
        return solicitudRepository.findByEstado(estado)
                .map(solicitudMapper::entityToDto)
                .doOnComplete(() -> log.info("Búsqueda por estado completada"));
    }

    public Mono<VerificarSolicitudDTO> aprobarSolicitud(Integer idVerificar, String comentario) {
        log.info("Aprobando solicitud: {}", idVerificar);

        return solicitudRepository.findByIdVerificar(idVerificar)
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
                    return sequenceGenerator.generateSequence("perfil_tutor_sequence")
                            .flatMap(idTutor -> {
                                PerfilTutor perfil = new PerfilTutor();
                                perfil.setIdTutor(idTutor);
                                perfil.setVerificado(true);
                                perfil.setClasificacion(0.0f);
                                perfil.setIdUsuario(solicitud.getIdUsuario());
                                perfil.setIdVerificarSolicitud(solicitud.getIdVerificar());
                                perfil.setCreacion(ahora);
                                perfil.setActualizado(ahora);

                                return perfilTutorRepository.save(perfil)
                                        .flatMap(perfilGuardado -> {
                                            solicitud.setIdPerfilTutor(perfilGuardado.getIdTutor());
                                            return solicitudRepository.save(solicitud)
                                                    .flatMap(solicitudGuardada -> {
                                                        return usuarioRepository
                                                                .findByIdUsuario(solicitud.getIdUsuario())
                                                                .flatMap(usuario -> {
                                                                    usuario.setIdPerfilTutor(
                                                                            perfilGuardado.getIdTutor());
                                                                    usuario.setRol("DOCENTE");
                                                                    usuario.setActualizado(ahora);
                                                                    return usuarioRepository.save(usuario);
                                                                })
                                                                .thenReturn(solicitudGuardada);
                                                    });
                                        });
                            });
                })
                .map(solicitudGuardada -> {
                    log.info("Solicitud aprobada y perfil de tutor creado");
                    return solicitudMapper.entityToDto(solicitudGuardada);
                });
    }

    public Mono<VerificarSolicitudDTO> rechazarSolicitud(Integer idVerificar, String comentario) {
        log.info("Rechazando solicitud: {}", idVerificar);

        return solicitudRepository.findByIdVerificar(idVerificar)
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
                    log.info("Solicitud rechazada");
                    return solicitudMapper.entityToDto(guardada);
                });
    }

    public Mono<Void> eliminarSolicitud(Integer idVerificar) {
        log.info("Eliminando solicitud: {}", idVerificar);

        return solicitudRepository.existsByIdVerificar(idVerificar)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Solicitud no encontrada con id: {}", idVerificar);
                        return Mono.error(new RuntimeException("Solicitud no encontrada"));
                    }

                    return solicitudRepository.deleteByIdVerificar(idVerificar)
                            .doOnSuccess(v -> log.info("Solicitud eliminada exitosamente"));
                });
    }
}