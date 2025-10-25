package com.enseniamelo.mensajeservice.models;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private Integer mensajeId;
    private String contenido;
    private Integer estado;
    private LocalDate fecha;
    private LocalTime hora;
    private String chatId;
}
