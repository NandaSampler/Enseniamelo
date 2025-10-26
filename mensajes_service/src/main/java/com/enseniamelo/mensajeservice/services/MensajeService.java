package com.enseniamelo.mensajeservice.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

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
        mensaje.setFecha(LocalDate.now().toString());
        mensaje.setHora(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        mensaje.setEstado(0); // Estado inicial: no leído
        return mensajeRepository.save(mensaje)
                .map(mensajeMapper::toDto)
                .doOnSuccess(savedMensajeDTO -> log.info("Mensaje creado exitosamente: {}", savedMensajeDTO))
                .doOnError(error -> log.error("Error al crear el mensaje: {}", error.getMessage()));
    }

    public Flux<MensajeDTO> obtenerTodos() {
        log.info("Obteniendo todos los mensajes");
        return mensajeRepository.findAll()
                .map(mensajeMapper::toDto)
                .doOnError(error -> log.error("Error al obtener los mensajes: {}", error.getMessage()));
    }

    public Mono<MensajeDTO> obtenerPorId(String id) {
        log.info("Obteniendo mensaje con ID: {}", id);
        return mensajeRepository.findById(id)
                .map(mensajeMapper::toDto)
                .doOnSuccess(mensajeDTO -> log.info("Mensaje obtenido exitosamente: {}", mensajeDTO))
                .doOnError(error -> log.error("Error al obtener el mensaje: {}", error.getMessage()));
    }

    public Flux<MensajeDTO> obtenerPorContenidoYChat(String contenido, String idChat) {
        log.info("Obteniendo mensajes con contenido que contiene: {} y chatId: {}", contenido, idChat);
        return Flux.fromIterable(mensajeRepository.findAllMensajesByContenido(contenido, idChat))
                .map(mensajeMapper::toDto)
                .doOnComplete(() -> log.info("Consulta de mensajes por contenido y chatId finalizada"))
                .doOnError(error -> log.error("Error al obtener los mensajes por contenido: {}", error.getMessage()));
    }

    public Mono<MensajeDTO> actualizarContenido(String id, String nuevoContenido) {
        log.info("Actualizando contenido del mensaje con ID: {}", id);
        return mensajeRepository.findById(id)
                .flatMap(existingMensaje -> {
                    existingMensaje.setContenido(nuevoContenido);
                    return mensajeRepository.save(existingMensaje);
                })
                .map(mensajeMapper::toDto)
                .doOnSuccess(updatedMensajeDTO -> log.info("Contenido del mensaje actualizado exitosamente: {}",
                        updatedMensajeDTO))
                .doOnError(error -> log.error("Error al actualizar el contenido del mensaje: {}", error.getMessage()));
    }
    
    public Mono<Void> eliminarMensaje(String id) {
        log.info("Eliminando mensaje con ID: {}", id);
        return mensajeRepository.findById(id)
                .flatMap(existingMensaje -> mensajeRepository.delete(existingMensaje)
                .doOnSuccess(v -> log.info("Mensaje eliminado exitosamente con ID: {}", id)))
                .doOnError(error -> log.error("Error al eliminar el mensaje: {}", error.getMessage()));
    }
}
