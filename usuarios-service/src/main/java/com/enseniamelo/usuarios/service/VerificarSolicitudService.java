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

    // idUsuario = Usuario.id (String)
    public Mono<VerificarSolicitudDTO> crearSolicitud(String idUsuario, VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud de verificación para usuario: {}", idUsuario);

        return usuarioRepository.existsById(idUsuario)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Usuario no encontrado con id: {}", idUsuario);
                        return Mono.error(new RuntimeException("Usuario no encontrado con id: " + idUsuario));
                    }

                    return solicitudRepository.existsByIdUsuario(idUsuario)
                            .flatMap(tieneSolicitud -> {
                                if (tieneSolicitud) {
                                    log.error("El usuario {} ya tiene una solicitud", idUsuario);
                                    return Mono.error(new RuntimeException(
                                            "El usuario ya tiene una solicitud de verificación"));
                                }

                                VerificarSolicitud solicitud = new VerificarSolicitud();
                                solicitud.setId(null); // Mongo genera _id
                                solicitud.setEstado("PENDIENTE");
                                solicitud.setFotoCi(solicitudDTO.getFotoCi());
                                solicitud.setIdUsuario(idUsuario);

                                // 🔹 idCurso y archivos desde el DTO
                                solicitud.setIdCurso(solicitudDTO.getIdCurso());

                                // Si el cliente no envía archivos => lista vacía, nunca null
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
                    log.info("Solicitud creada exitosamente con id: {}", guardada.getId());
                    return solicitudMapper.entityToDto(guardada);
                });
    }

    public Mono<VerificarSolicitudDTO> crearSolicitud(VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud desde evento");

        String idUsuario = solicitudDTO.getIdUsuario();
        if (idUsuario == null) {
            return Mono.error(new RuntimeException("El idUsuario es obligatorio en el DTO"));
        }
        return crearSolicitud(idUsuario, solicitudDTO);
    }

    public Mono<Void> procesarVerificacion(String id) {
        log.info("Procesando verificación de solicitud: {}", id);

        return solicitudRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Solicitud no encontrada con id: " + id)))
                .flatMap(solicitud -> {
                    if (!"PENDIENTE".equals(solicitud.getEstado())) {
                        log.warn("La solicitud {} ya fue procesada. Estado actual: {}", id, solicitud.getEstado());
                        return Mono.empty();
                    }
                    log.info("Solicitud {} lista para ser aprobada o rechazada", id);
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

    public Mono<VerificarSolicitudDTO> buscarPorId(String id) {
        log.info("Buscando solicitud con id: {}", id);
        return solicitudRepository.findById(id)
                .map(solicitudMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Solicitud no encontrada con id: {}", id);
                    return Mono.error(new RuntimeException("Solicitud no encontrada con id: " + id));
                }));
    }

    public Mono<VerificarSolicitudDTO> buscarPorUsuario(String idUsuario) {
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

                    // Crear perfil de tutor a partir de la solicitud
                    PerfilTutor perfil = new PerfilTutor();
                    perfil.setId(null); // Mongo
                    perfil.setIdUsuario(solicitud.getIdUsuario());
                    // ci no la tenemos en la solicitud, se completará luego en el perfil
                    // perfil.setCi(null);
                    perfil.setVerificado("verificado");
                    perfil.setClasificacion(0.0f);
                    // perfil.setBiografia(null);
                    perfil.setCreacion(ahora);
                    perfil.setActualizado(ahora);

                    return perfilTutorRepository.save(perfil)
                            .flatMap(perfilGuardado -> {
                                // Relación inversa en la solicitud
                                solicitud.setIdPerfilTutor(perfilGuardado.getId());

                                return solicitudRepository.save(solicitud)
                                        .flatMap(solicitudGuardada -> usuarioRepository
                                                .findById(solicitud.getIdUsuario())
                                                .flatMap(usuario -> {
                                                    usuario.setRol("DOCENTE");
                                                    usuario.setActualizado(ahora);
                                                    return usuarioRepository.save(usuario);
                                                })
                                                .thenReturn(solicitudGuardada));
                            });
                })
                .map(solicitudGuardada -> {
                    log.info("Solicitud aprobada y perfil de tutor creado");
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
                    log.info("Solicitud rechazada");
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
}