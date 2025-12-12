package com.enseniamelo.usuarios.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "verificar_solicitud")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificarSolicitud {

    @Id
    private String id;

    @Field("id_usuario")
    private String idUsuario; // usuarios._id

    @Field("id_perfil_tutor")
    private String idPerfilTutor; // perfil_tutor._id

    @Field("id_curso")
    private String idCurso; // cursos._id (micro de cursos)

    private String estado;
    private String comentario;
    @Field("foto_ci")
    private String fotoCi;

    private List<String> archivos;

    @Field("creado")
    private LocalDateTime creado;
    private LocalDateTime decidido;
    private LocalDateTime actualizado;
}
