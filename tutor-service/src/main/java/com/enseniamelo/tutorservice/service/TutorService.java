package com.enseniamelo.tutorservice.service;

import com.enseniamelo.tutorservice.dto.TutorDTO;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TutorService {
    Flux<TutorDTO> findAll();

    Mono<TutorDTO> findById(Long id);
}
