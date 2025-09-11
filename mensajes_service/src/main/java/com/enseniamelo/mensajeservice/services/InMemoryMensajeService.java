package com.enseniamelo.mensajeservice.services;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.exceptions.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryMensajeService implements MensajeService {
    
    private final Map<Long, MensajeDTO> data = new ConcurrentHashMap<>();

    public InMemoryMensajeService() {
        Date date = new Date();

        data.put(1L, MensajeDTO.builder()
                .id(1L).texto("Mensaje 1").hora(date).estado("ENVIADO")
                .build());

        data.put(2L, MensajeDTO.builder()
                .id(2L).texto("Mensaje 2").hora(date).estado("ENVIADO")
                .build());
    }

    //Obtener todos los mensajes
    @Override
    public Flux<MensajeDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    //Obtener un mensaje por ID
    @Override
    public Mono<MensajeDTO> findById(Long id) {
        MensajeDTO m = data.get(id);
        return (m != null)
                ? Mono.just(m)
                : Mono.error(new ResourceNotFoundException("Mensaje", id));
    }

    //Crear un nuevo mensaje
    @Override
    public Mono<MensajeDTO> createMensaje(MensajeDTO mensajeDTO) {
        long id = data.size() + 1L;
        mensajeDTO = MensajeDTO.builder()
                .id(id)
                .texto(mensajeDTO.getTexto())
                .hora(mensajeDTO.getHora())
                .estado(mensajeDTO.getEstado())
                .build();
        data.put(id, mensajeDTO);
        return Mono.just(mensajeDTO);
    }

    //Actualizar un mensaje existente
    @Override
    public Mono<MensajeDTO> updateMensaje(Long id, MensajeDTO mensajeDTO) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Mensaje no encontrado con id: ", id));
        }
        MensajeDTO updated = MensajeDTO.builder()
                .id(id)
                .texto(mensajeDTO.getTexto())
                .hora(mensajeDTO.getHora())
                .estado(mensajeDTO.getEstado())
                .build();
        data.put(id, updated);
        return Mono.just(updated);
    }

    //Eliminar un mensaje por ID
    @Override
    public Mono<Void> deleteMensaje(Long id) {
        if (!data.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Mensaje no encontrado con id: ", id));
        }
        data.remove(id);
        return Mono.empty();
    }
}
