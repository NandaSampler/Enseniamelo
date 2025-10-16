package com.enseniamelo.usuarios.service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.mapper.UsuarioMapper;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final SequenceGeneratorService sequenceGenerator;
    @Transactional
    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        log.info("Creando usuario");
        if (usuarioDTO.getEmail() != null && usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            log.error("El email ya está registrado: {}", usuarioDTO.getEmail());
            throw new RuntimeException("El email ya está registrado");
        }
        Usuario usuario = usuarioMapper.dtoToEntity(usuarioDTO);
        Integer nuevoIdUsuario = sequenceGenerator.generateSequence("usuario_sequence");
        usuario.setIdUsuario(nuevoIdUsuario);
        LocalDateTime ahora = LocalDateTime.now();
        usuario.setCreado(ahora);
        usuario.setActualizado(ahora);
        
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        log.info("Usuario creado exitosamente con idUsuario: {}", usuarioGuardado.getIdUsuario());
        return usuarioMapper.entityToDto(usuarioGuardado);
    }
    public List<UsuarioDTO> obtenerTodos() {
        log.info("Obteniendo todos los usuarios");
        return usuarioMapper.entitiesToDtos(usuarioRepository.findAll());
    }
    public UsuarioDTO buscarPorIdUsuario(Integer idUsuario) {
        log.info("Buscando usuario con idUsuario: {}", idUsuario);
        return usuarioRepository.findByIdUsuario(idUsuario)
                .map(usuarioMapper::entityToDto)
                .orElseThrow(() -> {
                    log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                    return new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario);
                });
    }
    @Transactional
    public void eliminarPorIdUsuario(Integer idUsuario) {
        log.info("Eliminando usuario con idUsuario: {}", idUsuario);
        
        if (!usuarioRepository.existsByIdUsuario(idUsuario)) {
            log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
            throw new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario);
        }
        usuarioRepository.deleteByIdUsuario(idUsuario);
        log.info("Usuario eliminado exitosamente con idUsuario: {}", idUsuario);
    }
    @Transactional
    public UsuarioDTO actualizarUsuario(Integer idUsuario, UsuarioDTO usuarioDTO) {
        log.info("Actualizando usuario con idUsuario: {}", idUsuario);
        Usuario usuarioExistente = usuarioRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> {
                    log.error("Usuario no encontrado con idUsuario: {}", idUsuario);
                    return new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario);
                });
        usuarioMapper.updateEntityFromDto(usuarioDTO, usuarioExistente);
        usuarioExistente.setIdUsuario(idUsuario);
        Usuario guardado = usuarioRepository.save(usuarioExistente);
        log.info("Usuario actualizado exitosamente con idUsuario: {}", idUsuario);
        return usuarioMapper.entityToDto(guardado);
    }
}