package com.enseniamelo.tutorservice.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.enseniamelo.tutorservice.dto.TutorDTO;
import com.enseniamelo.tutorservice.exception.ResourceNotFoundException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class InMemoryTutorService implements TutorService {

    private final Map<Long, TutorDTO> data = new ConcurrentHashMap<>();

    public InMemoryTutorService() {
        data.put(1L, TutorDTO.builder()
                .id(1L).nombre("Ana López").materia("Matemáticas")
                .modalidad("VIRTUAL").ubicacion("La Paz")
                .tarifaPorHora(new BigDecimal("50"))
                .verificado(true).rating(4.7).build());

        data.put(2L, TutorDTO.builder()
                .id(2L).nombre("Carlos Pérez").materia("Física")
                .modalidad("PRESENCIAL").ubicacion("Cochabamba")
                .tarifaPorHora(new BigDecimal("60"))
                .verificado(false).rating(4.2).build());
    }

    @Override
    public Flux<TutorDTO> findAll() {
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<TutorDTO> findById(Long id) {
        TutorDTO t = data.get(id);
        return (t != null)
                ? Mono.just(t)
                : Mono.error(new ResourceNotFoundException("Tutor", id));
    }
}
