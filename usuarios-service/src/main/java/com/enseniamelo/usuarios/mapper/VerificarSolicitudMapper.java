package com.enseniamelo.usuarios.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.model.VerificarSolicitud;

@Mapper(componentModel = "spring")
public interface VerificarSolicitudMapper {

    // entity -> dto
    @Mapping(target = "nombreUsuario", ignore = true)
    @Mapping(target = "emailUsuario", ignore = true)
    VerificarSolicitudDTO entityToDto(VerificarSolicitud entity);
    // idCurso y archivos se mapean solos por nombre

    // dto -> entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idUsuario", ignore = true)
    @Mapping(target = "idPerfilTutor", ignore = true)
    @Mapping(target = "creado", ignore = true)
    @Mapping(target = "decidido", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    VerificarSolicitud dtoToEntity(VerificarSolicitudDTO dto);

    List<VerificarSolicitudDTO> entitiesToDtos(List<VerificarSolicitud> entities);

    List<VerificarSolicitud> dtosToEntities(List<VerificarSolicitudDTO> dtos);
}
