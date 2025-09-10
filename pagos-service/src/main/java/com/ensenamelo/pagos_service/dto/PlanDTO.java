package com.ensenamelo.pagos_service.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanDTO {
    private Long id;
    @NotBlank private String nombre;
    @NotNull @DecimalMin(value = "0.0", inclusive = false) private BigDecimal precio;
    @NotNull @Min(1) private Integer duracion; 
    @NotBlank private String estado; 
}
