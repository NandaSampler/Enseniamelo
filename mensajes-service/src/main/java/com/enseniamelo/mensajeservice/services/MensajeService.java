package com.enseniamelo.mensajeservice.services;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.mapper.MensajeMapper;
import com.enseniamelo.mensajeservice.models.Mensaje;
import com.enseniamelo.mensajeservice.repository.MensajeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final MensajeMapper mensajeMapper;

    public Mono<MensajeDTO> crearMensaje(MensajeDTO mensajeDTO) {
        log.info("Creando un nuevo mensaje");

        Mensaje mensaje = mensajeMapper.toEntity(mensajeDTO);
        mensaje.setCreado(LocalDateTime.now());
        mensaje.setActualizado(LocalDateTime.now());

        return mensajeRepository.save(mensaje)
            .map(mensajeMapper::toDto)
            .doOnSuccess(m -> log.info("Mensaje creado exitosamente: {}", m))
            .doOnError(err -> log.error("Error al crear mensaje: {}", err.getMessage()));
    }

    public Flux<MensajeDTO> obtenerTodos() {
        return mensajeRepository.findAll()
            .map(mensajeMapper::toDto)
            .doOnError(err -> log.error("Error al obtener mensajes: {}", err.getMessage()));
    }

    public Mono<MensajeDTO> obtenerPorId(String id) {
        return mensajeRepository.findById(id)
            .map(mensajeMapper::toDto)
            .doOnError(err -> log.error("Error al obtener mensaje: {}", err.getMessage()));
    }

    public Mono<MensajeDTO> actualizarContenido(String id, String nuevoContenido) {
        return mensajeRepository.findById(id)
            .flatMap(existing -> {
                existing.setContenido(nuevoContenido);
                existing.setActualizado(LocalDateTime.now());
                return mensajeRepository.save(existing);
            })
            .map(mensajeMapper::toDto)
            .doOnError(err -> log.error("Error al actualizar mensaje: {}", err.getMessage()));
    }

    public Mono<Void> eliminarMensaje(String id) {
        return mensajeRepository.findById(id)
            .flatMap(mensajeRepository::delete)
            .doOnSuccess(v -> log.info("Mensaje eliminado con ID {}", id))
            .doOnError(err -> log.error("Error al eliminar mensaje: {}", err.getMessage()));
    }
}
