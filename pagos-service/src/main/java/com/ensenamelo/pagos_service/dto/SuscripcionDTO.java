package com.ensenamelo.pagos_service.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SuscripcionDTO {
    private Long id;
    @NotBlank private String userId;   
    @NotNull @Min(1) private Long planId;
    @NotNull private OffsetDateTime inicio;
    @NotNull private OffsetDateTime fin;
    @NotBlank private String estado;   
}
