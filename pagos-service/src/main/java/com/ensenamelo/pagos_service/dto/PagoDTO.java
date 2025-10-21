package com.ensenamelo.pagos_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoDTO {
    private Long id;
    @NotNull @Min(1) private Long suscripcionId;
    @NotNull @DecimalMin(value = "0.0", inclusive = false) private BigDecimal monto;
    @NotBlank private String metodo;   
    @NotBlank private String estado;  
    private OffsetDateTime createdAt;
}