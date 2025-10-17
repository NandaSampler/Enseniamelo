package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.mapper.VerificarSolicitudMapper;
import com.enseniamelo.usuarios.model.PerfilTutor;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.model.VerificarSolicitud;
import com.enseniamelo.usuarios.repository.PerfilTutorRepository;
import com.enseniamelo.usuarios.repository.UsuarioRepository;
import com.enseniamelo.usuarios.repository.VerificarSolicitudRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class VerificarSolicitudService {

    private final VerificarSolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilTutorRepository perfilTutorRepository;
    private final VerificarSolicitudMapper solicitudMapper;
    private final SequenceGeneratorService sequenceGenerator;
    @Transactional
    public VerificarSolicitudDTO crearSolicitud(Integer idUsuario, VerificarSolicitudDTO solicitudDTO) {
        log.info("Creando solicitud de verificación para usuario: {}", idUsuario);
        
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
        if (solicitudRepository.existsByUsuario(usuario)) {
            throw new RuntimeException("El usuario ya tiene una solicitud de verificación");
        }
    
        VerificarSolicitud solicitud = new VerificarSolicitud();
        solicitud.setIdVerificar(sequenceGenerator.generateSequence("verificar_solicitud_sequence"));
        solicitud.setEstado("PENDIENTE");
        solicitud.setFotoCi(solicitudDTO.getFotoCi());
        solicitud.setUsuario(usuario);
        
        LocalDateTime ahora = LocalDateTime.now();
        solicitud.setCreado(ahora);
        solicitud.setActualizado(ahora);
        
        VerificarSolicitud guardada = solicitudRepository.save(solicitud);
        usuario.setVerificarSolicitud(guardada);
        usuarioRepository.save(usuario);
        
        log.info("Solicitud creada exitosamente con id: {}", guardada.getIdVerificar());
        return solicitudMapper.entityToDto(guardada);
    }
    public List<VerificarSolicitudDTO> obtenerTodas() {
        log.info("Obteniendo todas las solicitudes");
        return solicitudMapper.entitiesToDtos(solicitudRepository.findAll());
    }
    public VerificarSolicitudDTO buscarPorId(Integer idVerificar) {
        log.info("Buscando solicitud con id: {}", idVerificar);
        return solicitudRepository.findByIdVerificar(idVerificar)
            .map(solicitudMapper::entityToDto)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con id: " + idVerificar));
    }
    public VerificarSolicitudDTO buscarPorUsuario(Integer idUsuario) {
        log.info("Buscando solicitud del usuario: {}", idUsuario);
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con idUsuario: " + idUsuario));
        
        return solicitudRepository.findByUsuario(usuario)
            .map(solicitudMapper::entityToDto)
            .orElseThrow(() -> new RuntimeException("No se encontró solicitud para el usuario: " + idUsuario));
    }
    public List<VerificarSolicitudDTO> obtenerPorEstado(String estado) {
        log.info("Obteniendo solicitudes con estado: {}", estado);
        return solicitudMapper.entitiesToDtos(solicitudRepository.findByEstado(estado));
    }
    @Transactional
    public VerificarSolicitudDTO aprobarSolicitud(Integer idVerificar, String comentario) {
        log.info("Aprobando solicitud: {}", idVerificar);
        
        VerificarSolicitud solicitud = solicitudRepository.findByIdVerificar(idVerificar)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        if (!"PENDIENTE".equals(solicitud.getEstado())) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }
    
        solicitud.setEstado("APROBADO");
        solicitud.setComentario(comentario);
        LocalDateTime ahora = LocalDateTime.now();
        solicitud.setDecidido(ahora);
        solicitud.setActualizado(ahora);
        PerfilTutor perfil = new PerfilTutor();
        perfil.setIdTutor(sequenceGenerator.generateSequence("perfil_tutor_sequence"));
        perfil.setVerificado(true);
        perfil.setClasificacion(0.0f);
        perfil.setUsuario(solicitud.getUsuario());
        perfil.setVerificarSolicitud(solicitud);
        perfil.setCreacion(ahora);
        perfil.setActualizado(ahora);
        
        PerfilTutor perfilGuardado = perfilTutorRepository.save(perfil);
        solicitud.setPerfilTutor(perfilGuardado);
        VerificarSolicitud solicitudGuardada = solicitudRepository.save(solicitud);
        Usuario usuario = solicitud.getUsuario();
        usuario.setPerfilTutor(perfilGuardado);
        usuario.setRol("DOCENTE");
        usuario.setActualizado(ahora);
        usuarioRepository.save(usuario);
        
        log.info("Solicitud aprobada y perfil de tutor creado");
        return solicitudMapper.entityToDto(solicitudGuardada);
    }
    @Transactional
    public VerificarSolicitudDTO rechazarSolicitud(Integer idVerificar, String comentario) {
        log.info("Rechazando solicitud: {}", idVerificar);
        
        VerificarSolicitud solicitud = solicitudRepository.findByIdVerificar(idVerificar)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        if (!"PENDIENTE".equals(solicitud.getEstado())) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }
        
        solicitud.setEstado("RECHAZADO");
        solicitud.setComentario(comentario);
        LocalDateTime ahora = LocalDateTime.now();
        solicitud.setDecidido(ahora);
        solicitud.setActualizado(ahora);
        
        VerificarSolicitud guardada = solicitudRepository.save(solicitud);
        
        log.info("Solicitud rechazada");
        return solicitudMapper.entityToDto(guardada);
    }
    @Transactional
    public void eliminarSolicitud(Integer idVerificar) {
        log.info("Eliminando solicitud: {}", idVerificar);
        
        if (!solicitudRepository.existsByIdVerificar(idVerificar)) {
            throw new RuntimeException("Solicitud no encontrada");
        }
        
        solicitudRepository.deleteByIdVerificar(idVerificar);
        log.info("Solicitud eliminada exitosamente");
    }
}