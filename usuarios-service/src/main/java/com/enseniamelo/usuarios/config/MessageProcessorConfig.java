package com.enseniamelo.usuarios.config;

import java.util.function.Consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.service.PerfilTutorService;
import com.enseniamelo.usuarios.service.UsuarioService;
import com.enseniamelo.usuarios.service.VerificarSolicitudService;
import com.enseniamelo.usuarios.util.events.Event;

@Configuration
public class MessageProcessorConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageProcessorConfig.class);

    private final UsuarioService usuarioService;
    private final PerfilTutorService perfilTutorService;
    private final VerificarSolicitudService verificarSolicitudService;

    @Autowired
    public MessageProcessorConfig(
            UsuarioService usuarioService,
            PerfilTutorService perfilTutorService,
            VerificarSolicitudService verificarSolicitudService) {
        this.usuarioService = usuarioService;
        this.perfilTutorService = perfilTutorService;
        this.verificarSolicitudService = verificarSolicitudService;
    }

    // -------------------------------------------------------------------------
    // USUARIO (key = String id de Mongo)
    // -------------------------------------------------------------------------
    @Bean
    public Consumer<Event<String, UsuarioDTO>> usuarioProcessor() {
        return event -> {
            LOGGER.info("📨 [USUARIO] Evento: tipo={}, id={}",
                    event.getEventType(), event.getKey());

            try {
                switch (event.getEventType()) {
                    case CREATE -> {
                        LOGGER.info("Creando usuario");
                        usuarioService.crearUsuario(event.getData()).block();
                    }
                    case DELETE -> {
                        LOGGER.info("Eliminando usuario con id: {}", event.getKey());
                        usuarioService.eliminarPorId(event.getKey()).block();
                    }
                    case UPDATE -> {
                        LOGGER.info("Actualizando usuario con id: {}", event.getKey());
                        usuarioService
                                .actualizarUsuario(event.getKey(), event.getData())
                                .block();
                    }
                    default -> LOGGER.warn("[USUARIO] Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[USUARIO] Completado");
            } catch (Exception e) {
                LOGGER.error("[USUARIO] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de usuario", e);
            }
        };
    }

    // -------------------------------------------------------------------------
    // PERFIL TUTOR (key = String id de Mongo del perfil_tutor)
    // -------------------------------------------------------------------------
    @Bean
    public Consumer<Event<String, PerfilTutorDTO>> tutorProcessor() {
        return event -> {
            LOGGER.info("[TUTOR] Evento: tipo={}, id={}",
                    event.getEventType(), event.getKey());

            try {
                switch (event.getEventType()) {
                    case CREATE -> {
                        LOGGER.info("Creando perfil tutor");
                        perfilTutorService.crearPerfilTutor(event.getData()).block();
                    }
                    case DELETE -> {
                        LOGGER.info("Eliminando tutor con idPerfil: {}", event.getKey());
                        perfilTutorService.eliminarPerfil(event.getKey()).block();
                    }
                    case UPDATE -> {
                        LOGGER.info("Actualizando tutor con idPerfil: {}", event.getKey());
                        perfilTutorService.actualizarPerfil(event.getKey(), event.getData()).block();
                    }
                    default -> LOGGER.warn("[TUTOR] Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[TUTOR] Completado");
            } catch (Exception e) {
                LOGGER.error("[TUTOR] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de tutor", e);
            }
        };
    }

    // -------------------------------------------------------------------------
    // SOLICITUD VERIFICACIÓN (key = String id de Mongo de verificar_solicitud)
    // -------------------------------------------------------------------------
    @Bean
    public Consumer<Event<String, VerificarSolicitudDTO>> solicitudProcessor() {
        return event -> {
            LOGGER.info("[SOLICITUD] Evento: tipo={}, id={}",
                    event.getEventType(), event.getKey());

            try {
                String id = event.getKey();

                switch (event.getEventType()) {
                    case CREATE -> {
                        LOGGER.info("Creando solicitud de verificación");
                        verificarSolicitudService.crearSolicitud(event.getData()).block();
                    }
                    case APPROVE_REQUEST -> {
                        VerificarSolicitudDTO aprobar = event.getData();
                        LOGGER.info("Aprobando solicitud: {}", id);
                        verificarSolicitudService
                                .aprobarSolicitud(id, aprobar.getComentario())
                                .block();
                    }
                    case REJECT_REQUEST -> {
                        VerificarSolicitudDTO rechazar = event.getData();
                        LOGGER.info("Rechazando solicitud: {}", id);
                        verificarSolicitudService
                                .rechazarSolicitud(id, rechazar.getComentario())
                                .block();
                    }
                    case DELETE -> {
                        LOGGER.info("Eliminando solicitud: {}", id);
                        verificarSolicitudService.eliminarSolicitud(id).block();
                    }
                    default -> LOGGER.warn("[SOLICITUD] Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[SOLICITUD] Completado");
            } catch (Exception e) {
                LOGGER.error("[SOLICITUD] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de solicitud", e);
            }
        };
    }
}
