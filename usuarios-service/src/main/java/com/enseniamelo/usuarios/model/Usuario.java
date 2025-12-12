package com.enseniamelo.usuarios.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    private String id; // ESTE será el id_usuario que verá curso-service

    private String nombre;
    private String apellido;
    private String telefono;

    @Indexed
    private String email;

    @JsonIgnore
    private String contrasenia;

    private Integer rolCodigo; // 1=estudiante, 2=tutor, etc.
    private String rol; // "estudiante", "tutor", "admin", ...

    private String foto;

    private List<String> documentos;

    private Boolean activo;

    @Field("fechaCreacion")
    private LocalDateTime fechaCreacion;
    private LocalDateTime creado;
    private LocalDateTime actualizado; // si quieres empezar a usarlo

}
