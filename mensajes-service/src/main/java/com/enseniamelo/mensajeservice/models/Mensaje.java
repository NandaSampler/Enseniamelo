package com.enseniamelo.mensajeservice.models;

import java.time.LocalDateTime;
import org.bson.types.ObjectId;

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
    
    private ObjectId id_chat;

    private ObjectId remitente;

    private String contenido;

    private LocalDateTime creado;
    private LocalDateTime actualizado;
}
