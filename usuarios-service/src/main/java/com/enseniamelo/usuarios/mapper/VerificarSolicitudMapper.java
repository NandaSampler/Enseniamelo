package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.enseniamelo.usuarios.dto.VerificarSolicitudDTO;
import com.enseniamelo.usuarios.model.VerificarSolicitud;

import java.util.List;

@Mapper(
    componentModel = "spring"
)
public interface VerificarSolicitudMapper {
    @Mapping(target = "idUsuario", source = "idUsuario")  
    @Mapping(target = "nombreUsuario", ignore = true)  
    @Mapping(target = "emailUsuario", ignore = true)  
    @Mapping(target = "idPerfilTutor", source = "idPerfilTutor")  
    VerificarSolicitudDTO entityToDto(VerificarSolicitud entity);
    VerificarSolicitud dtoToEntity(VerificarSolicitudDTO dto);
    List<VerificarSolicitudDTO> entitiesToDtos(List<VerificarSolicitud> entities);
    void updateEntityFromDto(VerificarSolicitudDTO dto, @MappingTarget VerificarSolicitud entity);
}