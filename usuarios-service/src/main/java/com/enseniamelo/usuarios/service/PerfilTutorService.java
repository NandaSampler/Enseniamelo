package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.mapper.PerfilTutorMapper;
import com.enseniamelo.usuarios.model.PerfilTutor;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.PerfilTutorRepository;
import com.enseniamelo.usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PerfilTutorService {

    private final PerfilTutorRepository perfilTutorRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilTutorMapper perfilTutorMapper;
    public List<PerfilTutorDTO> obtenerTodos() {
        log.info("Obteniendo todos los perfiles de tutores");
        return perfilTutorMapper.entitiesToDtos(perfilTutorRepository.findAll());
    }
    public PerfilTutorDTO buscarPorId(Integer idTutor) {
        log.info("Buscando perfil de tutor con id: {}", idTutor);
        return perfilTutorRepository.findByIdTutor(idTutor)
            .map(perfilTutorMapper::entityToDto)
            .orElseThrow(() -> new RuntimeException("Perfil de tutor no encontrado con id: " + idTutor));
    }
    public PerfilTutorDTO buscarPorUsuario(Integer idUsuario) {
        log.info("Buscando perfil del usuario: {}", idUsuario);
        
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
        
        return perfilTutorRepository.findByUsuario(usuario)
            .map(perfilTutorMapper::entityToDto)
            .orElseThrow(() -> new RuntimeException("El usuario no tiene perfil de tutor"));
    }
    public List<PerfilTutorDTO> obtenerVerificados() {
        log.info("Obteniendo tutores verificados");
        return perfilTutorMapper.entitiesToDtos(
            perfilTutorRepository.findByVerificado(true));
    }
    public List<PerfilTutorDTO> obtenerPorClasificacionMinima(Float clasificacionMinima) {
        log.info("Obteniendo tutores con clasificación >= {}", clasificacionMinima);
        return perfilTutorMapper.entitiesToDtos(
            perfilTutorRepository.findByVerificadoAndClasificacionGreaterThanEqual(true, clasificacionMinima));
    }
    @Transactional
    public PerfilTutorDTO actualizarPerfil(Integer idTutor, PerfilTutorDTO perfilDTO) {
        log.info("Actualizando perfil de tutor: {}", idTutor);
        
        PerfilTutor perfil = perfilTutorRepository.findByIdTutor(idTutor)
            .orElseThrow(() -> new RuntimeException("Perfil de tutor no encontrado"));
        if (perfilDTO.getCi() != null) {
            perfil.setCi(perfilDTO.getCi());
        }
        if (perfilDTO.getBiografia() != null) {
            perfil.setBiografia(perfilDTO.getBiografia());
        }
        
        perfil.setActualizado(LocalDateTime.now());
        
        PerfilTutor actualizado = perfilTutorRepository.save(perfil);
        log.info("Perfil actualizado exitosamente");
        
        return perfilTutorMapper.entityToDto(actualizado);
    }
    @Transactional
    public PerfilTutorDTO actualizarClasificacion(Integer idTutor, Float nuevaClasificacion) {
        log.info("Actualizando clasificación del tutor: {}", idTutor);
        
        PerfilTutor perfil = perfilTutorRepository.findByIdTutor(idTutor)
            .orElseThrow(() -> new RuntimeException("Perfil de tutor no encontrado"));
        
        perfil.setClasificacion(nuevaClasificacion);
        perfil.setActualizado(LocalDateTime.now());
        
        PerfilTutor actualizado = perfilTutorRepository.save(perfil);
        log.info("Clasificación actualizada a: {}", nuevaClasificacion);
        
        return perfilTutorMapper.entityToDto(actualizado);
    }
    public long contarVerificados() {
        return perfilTutorRepository.countByVerificado(true);
    }
    @Transactional
    public void eliminarPerfil(Integer idTutor) {
        log.info("Eliminando perfil de tutor: {}", idTutor);
        
        if (!perfilTutorRepository.existsByIdTutor(idTutor)) {
            throw new RuntimeException("Perfil de tutor no encontrado");
        }
        
        perfilTutorRepository.deleteByIdTutor(idTutor);
        log.info("Perfil eliminado exitosamente");
    }
}