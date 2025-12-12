package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.dto.ComentarioCursoDTO;

import java.time.LocalDateTime;

public class ComentarioCursoMapper {

    public static ComentarioCurso toEntity(ComentarioCursoDTO dto) {
        return ComentarioCurso.builder()
                .id_usuario(dto.getId_usuario())
                .id_curso(dto.getId_curso())
                .comentario(dto.getComentario())
                .clasificacion(dto.getClasificacion())
                .fechaCreacion(LocalDateTime.now()) 
                .activo(true)
                .build();
    }

    public static ComentarioCursoDTO toDTO(ComentarioCurso entity) {
        return ComentarioCursoDTO.builder()
                .id_usuario(entity.getId_usuario())
                .id_curso(entity.getId_curso())
                .comentario(entity.getComentario())
                .clasificacion(entity.getClasificacion())
                .fechaCreacion(entity.getFechaCreacion())
                .activo(entity.getActivo())
                .build();
    }
}
