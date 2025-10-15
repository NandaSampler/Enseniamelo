package com.enseniamelo.usuarios.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.mapper.UsuarioMapper;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
    }

    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        usuarioRepository.findByIdUsuario(usuarioDTO.getIdUsuario())
            .ifPresent(u -> {
                throw new RuntimeException("Usuario ya existe con idUsuario: " + usuarioDTO.getIdUsuario());
            });

        Usuario usuario = usuarioMapper.dtoToEntity(usuarioDTO);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return usuarioMapper.entityToDto(usuarioGuardado);
    }

    public List<UsuarioDTO> obtenerTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::entityToDto)
                .collect(Collectors.toList());
    }


    public UsuarioDTO buscarPorIdUsuario(Integer idUsuario) {
        return usuarioRepository.findByIdUsuario(idUsuario)
                .map(usuarioMapper::entityToDto)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
    }

    public void eliminarPorIdUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
        usuarioRepository.delete(usuario);
    }

    public UsuarioDTO actualizarUsuario(Integer idUsuario, UsuarioDTO usuarioDTO) {
        return usuarioRepository.findByIdUsuario(idUsuario)
                .map(usuarioExistente -> {
                    Usuario usuarioActualizado = usuarioMapper.dtoToEntity(usuarioDTO);
                    usuarioActualizado.setIdUsuario(idUsuario); // aseguramos que se use el mismo idUsuario
                    Usuario guardado = usuarioRepository.save(usuarioActualizado);
                    return usuarioMapper.entityToDto(guardado);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
    }
}
