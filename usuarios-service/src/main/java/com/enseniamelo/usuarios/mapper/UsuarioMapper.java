package com.enseniamelo.usuarios.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.model.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    @Mapping(target = "contrasenia", ignore = true)
    @Mapping(target = "idVerificarSolicitud", ignore = true)
    @Mapping(target = "estadoVerificacion", ignore = true)
    @Mapping(target = "idPerfilTutor", ignore = true)
    @Mapping(target = "tutorVerificado", ignore = true)
    UsuarioDTO entityToDto(Usuario entity);
    Usuario dtoToEntity(UsuarioDTO dto);
    List<UsuarioDTO> entitiesToDtos(List<Usuario> entities);
    List<Usuario> dtosToEntities(List<UsuarioDTO> dtos);
    @Mapping(target = "contrasenia", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(UsuarioDTO dto, @MappingTarget Usuario entity);
}
