package com.enseniamelo.commentsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO para crear o actualizar comentarios de curso")
public class ComentarioCursoDTO {

    // ✅ CAMBIO CRÍTICO: id_usuario NO debe tener @NotBlank porque se extrae del JWT
    @Schema(example = "672c8e8b3f6c4c1c4a3e9d21", description = "Identificador del usuario (se extrae automáticamente del JWT)")
    private String id_usuario;

    @NotBlank(message = "El id del curso es obligatorio")
    @Schema(example = "672c8e9a3f6c4c1c4a3e9d22", description = "Identificador del curso")
    private String id_curso;

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 250, message = "El comentario no puede superar los 250 caracteres")
    @Schema(example = "Excelente curso, muy bien explicado", description = "Texto del comentario")
    private String comentario;

    @NotNull(message = "La clasificación es obligatoria")
    @Min(value = 1, message = "La clasificación mínima es 1")
    @Max(value = 5, message = "La clasificación máxima es 5")
    @Schema(example = "4", description = "Clasificación del curso (1 a 5)")
    private Integer clasificacion;

    // Campos informativos de respuesta
    @Schema(example = "2025-01-01T12:34:56", description = "Fecha de creación del comentario")
    private LocalDateTime fechaCreacion;

    @Schema(example = "true", description = "Indica si el comentario está activo")
    private Boolean activo;
}