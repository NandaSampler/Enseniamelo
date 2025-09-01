package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UsuarioService {

    // Listar todos los usuarios
    Flux<UsuarioDTO> findAll();

    // Buscar usuario por ID
    Mono<UsuarioDTO> findById(Long id);

    // Crear un usuario
    Mono<UsuarioDTO> save(UsuarioDTO usuario);

    // Actualizar un usuario
    Mono<UsuarioDTO> update(Long id, UsuarioDTO usuario);

    // Eliminar un usuario
    Mono<Void> delete(Long id);
}
