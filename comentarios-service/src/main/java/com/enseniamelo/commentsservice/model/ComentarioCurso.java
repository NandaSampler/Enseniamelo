package com.enseniamelo.commentsservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comentario_curso")
public class ComentarioCurso {

    @Id
    private String idComentario;

    @NotBlank(message = "El id del curso es obligatorio")
    private String idCurso;

    @NotBlank(message = "El id del usuario es obligatorio")
    private String idUsuario;

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres")
    private String comentario;

    @NotNull(message = "La clasificación es obligatoria")
    private Float clasificacion;

    private String fecha;
}
