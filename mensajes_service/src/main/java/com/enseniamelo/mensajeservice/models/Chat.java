package com.enseniamelo.mensajeservice.models;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private Integer chatId;
    private LocalDate fechaCreacion;
    private String usuario_emisor;
    private String usuario_receptor;
}
