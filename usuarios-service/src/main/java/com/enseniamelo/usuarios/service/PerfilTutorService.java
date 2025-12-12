package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.mapper.PerfilTutorMapper;
import com.enseniamelo.usuarios.model.PerfilTutor;
import com.enseniamelo.usuarios.repository.PerfilTutorRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerfilTutorService {

    private final PerfilTutorRepository perfilTutorRepository;
    private final PerfilTutorMapper perfilTutorMapper;

    public Mono<PerfilTutorDTO> crearPerfilTutor(PerfilTutorDTO perfilDTO) {
        log.info("Creando perfil de tutor para usuario: {}", perfilDTO.getIdUsuario());

        String idUsuario = perfilDTO.getIdUsuario();
        if (idUsuario == null) {
            return Mono.error(new RuntimeException("idUsuario es obligatorio para crear perfil de tutor"));
        }

        return perfilTutorRepository.existsByIdUsuario(idUsuario)
                .flatMap(existe -> {
                    if (existe) {
                        log.error("El usuario {} ya tiene perfil de tutor", idUsuario);
                        return Mono.error(new RuntimeException("El usuario ya tiene perfil de tutor"));
                    }

                    PerfilTutor perfil = perfilTutorMapper.dtoToEntity(perfilDTO);
                    perfil.setId(null); // Mongo genera el _id
                    perfil.setIdUsuario(idUsuario);

                    // ci y biografia YA se copiaron del DTO por el mapper

                    // verificado: String en entidad, Boolean en DTO
                    if (perfilDTO.getVerificado() != null) {
                        perfil.setVerificado(
                                Boolean.TRUE.equals(perfilDTO.getVerificado()) ? "verificado" : "pendiente");
                    } else if (perfil.getVerificado() == null) {
                        perfil.setVerificado("pendiente");
                    }

                    if (perfil.getClasificacion() == null) {
                        perfil.setClasificacion(0.0f);
                    }

                    LocalDateTime ahora = LocalDateTime.now();
                    perfil.setCreacion(ahora);
                    perfil.setActualizado(ahora);

                    return perfilTutorRepository.save(perfil);
                })
                .map(guardado -> {
                    log.info("Perfil de tutor creado con id: {}", guardado.getId());
                    return perfilTutorMapper.entityToDto(guardado);
                });
    }

    public Flux<PerfilTutorDTO> obtenerTodos() {
        log.info("Obteniendo todos los perfiles de tutores");
        return perfilTutorRepository.findAll()
                .map(perfilTutorMapper::entityToDto)
                .doOnComplete(() -> log.info("Listado de tutores completado"));
    }

    public Mono<PerfilTutorDTO> buscarPorId(String idTutor) {
        log.info("Buscando perfil de tutor con id: {}", idTutor);
        return perfilTutorRepository.findById(idTutor)
                .map(perfilTutorMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Perfil de tutor no encontrado con id: {}", idTutor);
                    return Mono.error(new RuntimeException("Perfil de tutor no encontrado con id: " + idTutor));
                }));
    }

    public Mono<PerfilTutorDTO> buscarPorUsuario(String idUsuario) {
        log.info("Buscando perfil del usuario: {}", idUsuario);

        return perfilTutorRepository.findByIdUsuario(idUsuario)
                .map(perfilTutorMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("El usuario {} no tiene perfil de tutor", idUsuario);
                    return Mono.error(new RuntimeException("El usuario no tiene perfil de tutor"));
                }));
    }

    public Flux<PerfilTutorDTO> obtenerVerificados() {
        log.info("Obteniendo tutores verificados");
        return perfilTutorRepository.findByVerificado("verificado")
                .map(perfilTutorMapper::entityToDto)
                .doOnComplete(() -> log.info("Listado de tutores verificados completado"));
    }

    public Flux<PerfilTutorDTO> obtenerPorClasificacionMinima(Float clasificacionMinima) {
        log.info("Obteniendo tutores con clasificación >= {}", clasificacionMinima);
        return perfilTutorRepository
                .findByVerificadoAndClasificacionGreaterThanEqual("verificado", clasificacionMinima)
                .map(perfilTutorMapper::entityToDto)
                .doOnComplete(() -> log.info("Búsqueda por clasificación completada"));
    }

    public Mono<PerfilTutorDTO> actualizarPerfil(String idTutor, PerfilTutorDTO perfilDTO) {
        log.info("Actualizando perfil de tutor: {}", idTutor);

        return perfilTutorRepository.findById(idTutor)
                .switchIfEmpty(Mono.error(new RuntimeException("Perfil de tutor no encontrado")))
                .flatMap(perfil -> {
                    if (perfilDTO.getCi() != null) {
                        perfil.setCi(perfilDTO.getCi());
                    }
                    if (perfilDTO.getBiografia() != null) {
                        perfil.setBiografia(perfilDTO.getBiografia());
                    }
                    // verificado y clasificacion se manejan en otros flujos
                    perfil.setActualizado(LocalDateTime.now());

                    return perfilTutorRepository.save(perfil);
                })
                .map(actualizado -> {
                    log.info("Perfil actualizado exitosamente");
                    return perfilTutorMapper.entityToDto(actualizado);
                });
    }

    public Mono<PerfilTutorDTO> actualizarClasificacion(String idTutor, Float nuevaClasificacion) {
        log.info("Actualizando clasificación del tutor: {}", idTutor);

        return perfilTutorRepository.findById(idTutor)
                .switchIfEmpty(Mono.error(new RuntimeException("Perfil de tutor no encontrado")))
                .flatMap(perfil -> {
                    perfil.setClasificacion(nuevaClasificacion);
                    perfil.setActualizado(LocalDateTime.now());
                    return perfilTutorRepository.save(perfil);
                })
                .map(actualizado -> {
                    log.info("Clasificación actualizada a: {}", nuevaClasificacion);
                    return perfilTutorMapper.entityToDto(actualizado);
                });
    }

    public Mono<Long> contarVerificados() {
        log.info("Contando tutores verificados");
        return perfilTutorRepository.countByVerificado("verificado")
                .doOnSuccess(count -> log.info("Total de tutores verificados: {}", count));
    }

    public Mono<Void> eliminarPerfil(String idTutor) {
        log.info("Eliminando perfil de tutor: {}", idTutor);

        return perfilTutorRepository.existsById(idTutor)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Perfil de tutor no encontrado con id: {}", idTutor);
                        return Mono.error(new RuntimeException("Perfil de tutor no encontrado"));
                    }

                    return perfilTutorRepository.deleteById(idTutor)
                            .doOnSuccess(v -> log.info("Perfil eliminado exitosamente"));
                });
    }
}