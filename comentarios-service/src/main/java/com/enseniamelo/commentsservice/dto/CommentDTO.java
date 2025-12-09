package com.enseniamelo.commentsservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;

    @NotNull(message = "userId is required")
    private Long userId;

    private Long courseId;
    private Long tutorId;

    @NotBlank
    @Size(max = 500)
    private String comentario;

    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "5.0", inclusive = true)
    private Float calificacion;

    private LocalDateTime creadoEn;
}
