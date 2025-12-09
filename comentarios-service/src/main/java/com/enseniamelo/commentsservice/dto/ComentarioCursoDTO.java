package com.enseniamelo.commentsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO para crear o actualizar comentarios de curso")
public class ComentarioCursoDTO {

    @NotBlank(message = "El id del curso es obligatorio")
    @Schema(example = "CURSO001", description = "Identificador del curso")
    private String idCurso;

    @NotBlank(message = "El id del usuario es obligatorio")
    @Schema(example = "USER001", description = "Identificador del usuario")
    private String idUsuario;

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres")
    @Schema(example = "Excelente curso, muy bien explicado", description = "Texto del comentario")
    private String comentario;

    @NotNull(message = "La clasificación es obligatoria")
    @DecimalMin(value = "0.0", inclusive = true, message = "La clasificación mínima es 0.0")
    @DecimalMax(value = "5.0", inclusive = true, message = "La clasificación máxima es 5.0")
    @Schema(example = "4.8", description = "Clasificación del curso (0 a 5)")
    private Float clasificacion;
}
