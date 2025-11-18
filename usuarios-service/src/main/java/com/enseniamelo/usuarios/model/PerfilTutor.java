package com.enseniamelo.usuarios.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "perfil_tutor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilTutor {
    
    @Id
    @JsonIgnore
    private String id;
    
    @Indexed(unique = true)
    private Integer idTutor;
    
    private String ci;
    private Boolean verificado;
    private Float clasificacion;
    private String biografia;
    private Integer idUsuario;  
    private Integer idVerificarSolicitud;  
    private LocalDateTime creacion;
    private LocalDateTime actualizado;
}