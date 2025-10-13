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

    public Optional<UsuarioDTO> buscarPorId(String id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::entityToDto);
    }

    public Optional<UsuarioDTO> buscarPorIdUsuario(Integer idUsuario) {
        return usuarioRepository.findByIdUsuario(idUsuario)
                .map(usuarioMapper::entityToDto);
    }

    public Optional<UsuarioDTO> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::entityToDto);
    }

    public Optional<UsuarioDTO> actualizarUsuario(String id, UsuarioDTO usuarioDTO) {
        return usuarioRepository.findById(id).map(usuarioExistente -> {
            Usuario usuarioActualizado = usuarioMapper.dtoToEntity(usuarioDTO);
            usuarioActualizado.setId(id); // mantenemos el mismo ID de Mongo
            Usuario guardado = usuarioRepository.save(usuarioActualizado);
            return usuarioMapper.entityToDto(guardado);
        });
    }

    public void eliminarUsuario(String id) {
        usuarioRepository.deleteById(id);
    }
}
