package com.enseniamelo.usuarios.config;
import java.util.function.Consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.enseniamelo.usuarios.controller.UsuarioController;
import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.dto.UsuarioEvent;

@Configuration
public class MessageProcessorConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageProcessorConfig.class);

    private final UsuarioController usuarioController;

    @Autowired
    public MessageProcessorConfig(UsuarioController usuarioController) {
        this.usuarioController = usuarioController;
    }

    @Bean
    public Consumer<UsuarioEvent<String, UsuarioDTO>> messageProcessor() {
        return event -> {
            LOGGER.info("📨 Evento recibido para procesar: tipo={}, key={}, timestamp={}",
                    event.getEventType(), event.getKey(), event.getEventCreatedAt());

            switch (event.getEventType()) {
                case CREATE:
                    UsuarioDTO usuarioDTO = event.getData();
                    LOGGER.info("CREATE Usuario: {}", usuarioDTO.getEmail());
                    usuarioController.crearUsuario(usuarioDTO).block();
                    break;

                case DELETE:
                    String usuarioId = event.getKey();
                    LOGGER.info("DELETE Usuario con ID: {}", usuarioId);
                    usuarioController.eliminarUsuario(usuarioId).block();
                    break;

                default:
                    String errorMessage = "Tipo de evento desconocido: " + event.getEventType();
                    LOGGER.warn(errorMessage);
                    throw new RuntimeException(errorMessage);
            }

            LOGGER.info("Procesamiento completado!");
        };
    }
}