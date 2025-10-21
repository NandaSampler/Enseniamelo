package com.enseniamelo.usuarios.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @JsonIgnore
    private String id;
    
    @Indexed(unique = true)
    private Integer idUsuario;
    
    private String nombre;
    private String apellido;
    private String telefono;
    
    @Indexed
    private String email;
    
    @JsonIgnore
    private String contrasenia;
    
    private String rol;
    private String foto;
    private Integer idVerificarSolicitud;  
    private Integer idPerfilTutor;  
    
    private LocalDateTime creado;
    private LocalDateTime actualizado;
}