package com.enseniamelo.commentsservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comentario_curso")
public class ComentarioCurso {

    @Id
    private String idComentario; 

    @NotBlank(message = "El id del usuario es obligatorio")
    private String id_usuario;

    @NotBlank(message = "El id del curso es obligatorio")
    private String id_curso;

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 250, message = "El comentario no puede superar los 250 caracteres")
    private String comentario;

    @NotNull(message = "La clasificación es obligatoria")
    @Min(value = 1, message = "La clasificación mínima es 1")
    @Max(value = 5, message = "La clasificación máxima es 5")
    private Integer clasificacion;

    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Builder.Default
    private Boolean activo = true;
}
