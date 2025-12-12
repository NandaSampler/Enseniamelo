package com.enseniamelo.usuarios.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.usuarios.dto.PerfilTutorDTO;
import com.enseniamelo.usuarios.model.PerfilTutor;

@Mapper(componentModel = "spring")
public interface PerfilTutorMapper {

    // entity -> dto
    @Mapping(target = "verificado", expression = "java( \"verificado\".equalsIgnoreCase(entity.getVerificado()) )")
    @Mapping(target = "nombreCompleto", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "telefono", ignore = true)
    @Mapping(target = "foto", ignore = true)
    @Mapping(target = "idVerificarSolicitud", ignore = true)
    PerfilTutorDTO entityToDto(PerfilTutor entity);
    // biografia, clasificacion, idUsuario, creacion, actualizado se mapean solos

    // dto -> entity (para crear)
    @Mapping(target = "id", ignore = true) // Mongo genera el _id
    @Mapping(target = "idUsuario", ignore = true) // lo pones en el service
    @Mapping(target = "verificado", ignore = true) // lo decides en el service
    @Mapping(target = "clasificacion", ignore = true) // inicializas en el service
    @Mapping(target = "creacion", ignore = true) // timestamps en el service
    @Mapping(target = "actualizado", ignore = true)
    PerfilTutor dtoToEntity(PerfilTutorDTO dto);
    // biografia y ci se copian desde el DTO

    List<PerfilTutorDTO> entitiesToDtos(List<PerfilTutor> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idUsuario", ignore = true)
    @Mapping(target = "verificado", ignore = true)
    @Mapping(target = "clasificacion", ignore = true)
    @Mapping(target = "creacion", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    void updateEntityFromDto(PerfilTutorDTO dto, @MappingTarget PerfilTutor entity);
}
