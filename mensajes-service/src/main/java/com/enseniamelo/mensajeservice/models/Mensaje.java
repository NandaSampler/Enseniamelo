package com.enseniamelo.mensajeservice.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "mensaje")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mensaje {
    @Id
    @JsonIgnore
    private String id;

    @Indexed(unique = true)
    private String contenido;
    private Integer estado;
    private String fecha;
    private String hora;
    
    @Field("id_chat")
    private String chatId;
}
