package com.enseniamelo.tutorservice.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorDTO {
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String materia;

    @NotBlank
    private String modalidad;

    @NotBlank
    private String ubicacion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal tarifaPorHora;

    private boolean verificado;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    private Double rating;
}
