package com.enseniamelo.usuarios.config;

import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.service.UsuarioService;
import com.enseniamelo.usuarios.service.PerfilTutorService;
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


    @Bean
    public Consumer<Event<Integer, UsuarioDTO>> usuarioProcessor() {
        return event -> {
            LOGGER.info("📨 [USUARIO] Evento: tipo={}, id={}", 
                    event.getEventType(), event.getKey());

            try {
                switch (event.getEventType()) {
                    case CREATE:
                        LOGGER.info("Creando usuario");
                        usuarioService.crearUsuario(event.getData()).block();
                        break;
                    case DELETE:
                        LOGGER.info("Eliminando usuario: {}", event.getKey());
                        usuarioService.eliminarUsuario(event.getKey()).block();
                        break;
                    case UPDATE:
                        LOGGER.info("Actualizando usuario: {}", event.getKey());
                        usuarioService.actualizarUsuario(
                            event.getKey(), 
                            event.getData()
                        ).block();
                        break;
                    default:
                        LOGGER.warn("Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[USUARIO] Completado");
            } catch (Exception e) {
                LOGGER.error("[USUARIO] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de usuario", e);
            }
        };
    }


    @Bean
    public Consumer<Event<Integer, PerfilTutorDTO>> tutorProcessor() {
        return event -> {
            LOGGER.info("[TUTOR] Evento: tipo={}, id={}", 
                    event.getEventType(), event.getKey());

            try {
                switch (event.getEventType()) {
                    case CREATE:
                        LOGGER.info("Creando perfil tutor");
                        perfilTutorService.crearPerfilTutor(event.getData()).block();
                        break;
                    case DELETE:
                        LOGGER.info("Eliminando tutor: {}", event.getKey());
                        perfilTutorService.eliminarPerfilTutor(event.getKey()).block();
                        break;
                    case UPDATE:
                        LOGGER.info("Actualizando tutor: {}", event.getKey());
                        perfilTutorService.actualizarPerfilTutor(
                            event.getKey(), 
                            event.getData()
                        ).block();
                        break;
                    default:
                        LOGGER.warn("Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[TUTOR] Completado");
            } catch (Exception e) {
                LOGGER.error("[TUTOR] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de tutor", e);
            }
        };
    }

    @Bean
    public Consumer<Event<Integer, VerificarSolicitudDTO>> solicitudProcessor() {
        return event -> {
            LOGGER.info("[SOLICITUD] Evento: tipo={}, id={}", 
                    event.getEventType(), event.getKey());

            try {
                switch (event.getEventType()) {
                    case CREATE:
                        LOGGER.info("Creando solicitud de verificación");
                        verificarSolicitudService.crearSolicitud(event.getData()).block();
                        break;

                    case VERIFY_REQUEST:
                        LOGGER.info("Procesando verificación de solicitud: {}", event.getKey());
                        verificarSolicitudService.procesarVerificacion(event.getKey()).block();
                        break;

                    case APPROVE_REQUEST:
                        VerificarSolicitudDTO aprobar = event.getData();
                        LOGGER.info("Aprobando solicitud: {}", event.getKey());
                        verificarSolicitudService.aprobarSolicitud(
                            event.getKey(), 
                            aprobar.getComentario()
                        ).block();
                        break;

                    case REJECT_REQUEST:
                        VerificarSolicitudDTO rechazar = event.getData();
                        LOGGER.info("Rechazando solicitud: {}", event.getKey());
                        verificarSolicitudService.rechazarSolicitud(
                            event.getKey(), 
                            rechazar.getComentario()
                        ).block();
                        break;

                    case DELETE:
                        LOGGER.info("Eliminando solicitud: {}", event.getKey());
                        verificarSolicitudService.eliminarSolicitud(event.getKey()).block();
                        break;

                    default:
                        LOGGER.warn("Evento no soportado: {}", event.getEventType());
                }
                LOGGER.info("[SOLICITUD] Completado");
            } catch (Exception e) {
                LOGGER.error("[SOLICITUD] Error: {}", e.getMessage(), e);
                throw new RuntimeException("Error procesando evento de solicitud", e);
            }
        };
    }
}