package com.enseniamelo.commentsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursoDTO {
    private String id;
    private String nombre;
    private String descripcion;
    private String modalidad;
    private String idTutor;
    private String estado;
    private Boolean activo;
}