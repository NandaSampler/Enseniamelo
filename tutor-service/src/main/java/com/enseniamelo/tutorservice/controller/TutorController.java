package com.enseniamelo.tutorservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.tutorservice.dto.TutorDTO;
import com.enseniamelo.tutorservice.service.TutorService;

import jakarta.validation.constraints.Min;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorService service;

    public TutorController(TutorService service) {
        this.service = service;
    }

    @GetMapping
    public Flux<TutorDTO> getTutors() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Mono<TutorDTO> getTutorById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
