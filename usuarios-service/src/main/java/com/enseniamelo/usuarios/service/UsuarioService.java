package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.mapper.UsuarioMapper;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final SequenceGeneratorService sequenceGenerator;

    public Mono<UsuarioDTO> crearUsuario(UsuarioDTO usuarioDTO) {
        log.info("Creando usuario");

        return usuarioRepository.existsByEmail(usuarioDTO.getEmail())
                .flatMap(existe -> {
                    if (existe) {
                        log.error("El email ya está registrado: {}", usuarioDTO.getEmail());
                        return Mono.error(new RuntimeException("El email ya está registrado"));
                    }
                    Usuario usuario = usuarioMapper.dtoToEntity(usuarioDTO);

                    return sequenceGenerator.generateSequence("usuario_sequence")
                            .flatMap(nuevoId -> {
                                usuario.setIdUsuario(nuevoId);
                                LocalDateTime ahora = LocalDateTime.now();
                                usuario.setCreado(ahora);
                                usuario.setActualizado(ahora);

                                return usuarioRepository.save(usuario);
                            })
                            .map(usuarioGuardado -> {
                                log.info("Usuario creado exitosamente con idUsuario: {}",
                                        usuarioGuardado.getIdUsuario());
                                return usuarioMapper.entityToDto(usuarioGuardado);
                            });
                });
    }

    public Flux<UsuarioDTO> obtenerTodos() {
        log.info("Obteniendo todos los usuarios");

        return usuarioRepository.findAll()
                .map(usuarioMapper::entityToDto)
                .doOnComplete(() -> log.info("Listado de usuarios completado"));
    }

    public Mono<UsuarioDTO> buscarPorIdUsuario(Integer idUsuario) {
        log.info("Buscando usuario con idUsuario: {}", idUsuario);

        return usuarioRepository.findByIdUsuario(idUsuario)
                .map(usuarioMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                    return Mono.error(new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
                }))
                .doOnSuccess(usuario -> log.info("Usuario {} encontrado", idUsuario));
    }

    public Mono<Void> eliminarUsuario(Integer idUsuario) {
        log.info("Eliminando usuario: {}", idUsuario);
        return eliminarPorIdUsuario(idUsuario);
    }

    public Mono<Void> eliminarPorIdUsuario(Integer idUsuario) {
        log.info("Eliminando usuario con idUsuario: {}", idUsuario);

        return usuarioRepository.existsByIdUsuario(idUsuario)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                        return Mono.error(new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
                    }

                    return usuarioRepository.deleteByIdUsuario(idUsuario)
                            .doOnSuccess(v -> log.info("Usuario eliminado exitosamente con idUsuario: {}", idUsuario));
                });
    }

    public Mono<UsuarioDTO> actualizarUsuario(Integer idUsuario, UsuarioDTO usuarioDTO) {
        log.info("Actualizando usuario con idUsuario: {}", idUsuario);

        return usuarioRepository.findByIdUsuario(idUsuario)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                    return Mono.error(new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
                }))
                .flatMap(usuarioExistente -> {
                    usuarioMapper.updateEntityFromDto(usuarioDTO, usuarioExistente);
                    usuarioExistente.setIdUsuario(idUsuario);
                    usuarioExistente.setActualizado(LocalDateTime.now());
                    return usuarioRepository.save(usuarioExistente);
                })
                .map(guardado -> {
                    log.info("Usuario actualizado exitosamente con idUsuario: {}", idUsuario);
                    return usuarioMapper.entityToDto(guardado);
                });
    }
}