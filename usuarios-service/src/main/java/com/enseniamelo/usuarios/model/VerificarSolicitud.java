package com.enseniamelo.usuarios.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "verificar_solicitud")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificarSolicitud {
    
    @Id
    @JsonIgnore
    private String id;
    
    @Indexed(unique = true)
    private Integer idVerificar;
    
    private String estado;
    private String comentario;
    private String fotoCi;
    private Integer idUsuario;  
    private Integer idPerfilTutor;  
    private LocalDateTime creado;
    private LocalDateTime decidido;
    private LocalDateTime actualizado;
}