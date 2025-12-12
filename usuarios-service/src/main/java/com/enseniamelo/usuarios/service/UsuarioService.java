package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;
import java.util.Collections;

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

    public Mono<UsuarioDTO> crearUsuario(UsuarioDTO usuarioDTO) {
        log.info("Creando usuario");

        return usuarioRepository.existsByEmail(usuarioDTO.getEmail())
                .flatMap(existe -> {
                    if (existe) {
                        log.error("El email ya está registrado: {}", usuarioDTO.getEmail());
                        return Mono.error(new RuntimeException("El email ya está registrado"));
                    }

                    Usuario usuario = usuarioMapper.dtoToEntity(usuarioDTO);
                    usuario.setId(null); // Mongo genera el _id

                    LocalDateTime ahora = LocalDateTime.now();

                    // 🔹 Rol viene del DTO: ADMIN | DOCENTE | ESTUDIANTE
                    String rol = usuario.getRol();
                    if (rol == null) {
                        // fallback por si alguien manda DTO sin rol (no debería)
                        rol = "ESTUDIANTE";
                        usuario.setRol(rol);
                    }

                    // 🔹 Mapear rol → rolCodigo (1=ESTUDIANTE, 2=DOCENTE, 3=ADMIN por ejemplo)
                    if (usuario.getRolCodigo() == null) {
                        switch (rol) {
                            case "ADMIN" -> usuario.setRolCodigo(3);
                            case "DOCENTE" -> usuario.setRolCodigo(2);
                            case "ESTUDIANTE" -> usuario.setRolCodigo(1);
                            default -> usuario.setRolCodigo(1);
                        }
                    }

                    if (usuario.getActivo() == null) {
                        usuario.setActivo(true);
                    }
                    if (usuario.getDocumentos() == null) {
                        usuario.setDocumentos(Collections.emptyList());
                    }

                    usuario.setFechaCreacion(ahora);
                    usuario.setCreado(ahora);
                    usuario.setActualizado(ahora);

                    return usuarioRepository.save(usuario)
                            .map(usuarioGuardado -> {
                                log.info("Usuario creado exitosamente con id: {}", usuarioGuardado.getId());
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

    public Mono<UsuarioDTO> buscarPorId(String id) {
        log.info("Buscando usuario con id: {}", id);

        return usuarioRepository.findById(id)
                .map(usuarioMapper::entityToDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Usuario no encontrado con id: {}", id);
                    return Mono.error(new RuntimeException("Usuario no encontrado con id: " + id));
                }))
                .doOnSuccess(usuario -> log.info("Usuario {} encontrado", id));
    }

    public Mono<UsuarioDTO> buscarPorEmail(String email) {
        log.info("Buscando usuario por email: {}", email);
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::entityToDto);
    }

    public Mono<Void> eliminarPorId(String id) {
        log.info("Eliminando usuario con id: {}", id);

        return usuarioRepository.existsById(id)
                .flatMap(existe -> {
                    if (!existe) {
                        log.error("Usuario no encontrado con id: {}", id);
                        return Mono.error(new RuntimeException("Usuario no encontrado con id: " + id));
                    }

                    return usuarioRepository.deleteById(id)
                            .doOnSuccess(v -> log.info("Usuario eliminado exitosamente con id: {}", id));
                });
    }

    public Mono<UsuarioDTO> actualizarUsuario(String id, UsuarioDTO usuarioDTO) {
        log.info("Actualizando usuario con id: {}", id);

        return usuarioRepository.findById(id)
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Usuario no encontrado con id: {}", id);
                    return Mono.error(new RuntimeException("Usuario no encontrado con id: " + id));
                }))
                .flatMap(usuarioExistente -> {
                    // Actualiza campos “editables” según el mapper
                    usuarioMapper.updateEntityFromDto(usuarioDTO, usuarioExistente);

                    // Si cambiaron el rol en el DTO, recalculamos rolCodigo
                    String rol = usuarioExistente.getRol();
                    if (rol != null) {
                        switch (rol) {
                            case "ADMIN" -> usuarioExistente.setRolCodigo(3);
                            case "DOCENTE" -> usuarioExistente.setRolCodigo(2);
                            case "ESTUDIANTE" -> usuarioExistente.setRolCodigo(1);
                        }
                    }

                    usuarioExistente.setActualizado(LocalDateTime.now());
                    return usuarioRepository.save(usuarioExistente);
                })
                .map(guardado -> {
                    log.info("Usuario actualizado exitosamente con id: {}", id);
                    return usuarioMapper.entityToDto(guardado);
                });
    }
}
