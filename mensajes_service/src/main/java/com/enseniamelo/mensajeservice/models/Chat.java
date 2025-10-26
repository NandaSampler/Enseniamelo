package com.enseniamelo.mensajeservice.models;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "chat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    @Id
    @JsonIgnore
    private String id;

    @Indexed(unique = true)
    @Field("fecha_creacion")
    private LocalDate fechaCreacion;

    @Field("id_usuario_emisor")
    private String usuario_emisor;

    @Field("id_usuario_receptor")
    private String usuario_receptor;
}
