package com.enseniamelo.usuarios.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "perfil_tutor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilTutor {

    @Id
    private String id;

    @Field("id_usuario")
    private String idUsuario; // referencia a usuarios._id

    private String ci;

    // en Mongo se veía "verificado": "verificado" / "pendiente" / ...
    private String verificado;

    private Float clasificacion;
    private String biografia;

    @Field("creacion")
    private LocalDateTime creacion;
    private LocalDateTime actualizado;
}