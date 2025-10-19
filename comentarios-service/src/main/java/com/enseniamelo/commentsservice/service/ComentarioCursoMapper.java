package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.model.ComentarioCurso;
import com.enseniamelo.commentsservice.dto.ComentarioCursoDTO;

import java.time.LocalDate;

public class ComentarioCursoMapper {

    public static ComentarioCurso toEntity(ComentarioCursoDTO dto) {
        return ComentarioCurso.builder()
                .idCurso(dto.getIdCurso())
                .idUsuario(dto.getIdUsuario())
                .comentario(dto.getComentario())
                .clasificacion(dto.getClasificacion())
                .fecha(LocalDate.now().toString())
                .build();
    }

    public static ComentarioCursoDTO toDTO(ComentarioCurso entity) {
        return ComentarioCursoDTO.builder()
                .idCurso(entity.getIdCurso())
                .idUsuario(entity.getIdUsuario())
                .comentario(entity.getComentario())
                .clasificacion(entity.getClasificacion())
                .build();
    }
}
