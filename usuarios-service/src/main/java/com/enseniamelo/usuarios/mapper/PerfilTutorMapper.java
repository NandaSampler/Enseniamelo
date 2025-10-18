package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.model.PerfilTutor;

import java.util.List;

@Mapper(
    componentModel = "spring"
)
public interface PerfilTutorMapper {
    @Mapping(target = "idUsuario", source = "idUsuario")  
    @Mapping(target = "nombreCompleto", ignore = true)  
    @Mapping(target = "email", ignore = true) 
    @Mapping(target = "telefono", ignore = true)  
    @Mapping(target = "foto", ignore = true) 
    @Mapping(target = "idVerificarSolicitud", source = "idVerificarSolicitud")  
    PerfilTutorDTO entityToDto(PerfilTutor entity);
    PerfilTutor dtoToEntity(PerfilTutorDTO dto);
    List<PerfilTutorDTO> entitiesToDtos(List<PerfilTutor> entities);
    void updateEntityFromDto(PerfilTutorDTO dto, @MappingTarget PerfilTutor entity);
}