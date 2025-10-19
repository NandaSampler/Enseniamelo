package com.enseniamelo.tutorservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enseniamelo.tutorservice.dto.TutorDTO;
import com.enseniamelo.tutorservice.service.TutorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
        summary = "${api.tutor.get-tutors.description}",
        description = "${api.tutor.get-tutors.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping
    public Flux<TutorDTO> getTutors() {
        return service.findAll();
    }

    @Operation(
        summary = "${api.tutor.get-tutor.description}",
        description = "${api.tutor.get-tutor.notes}"
    )
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
            @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
            @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")})
    @GetMapping("/{id}")
    public Mono<TutorDTO> getTutorById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
