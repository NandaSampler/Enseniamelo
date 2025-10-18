package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.dto.UsuarioDTO;

import java.util.List;

@Mapper(
    componentModel = "spring"
)
public interface UsuarioMapper {
    @Mapping(target = "contrasenia", ignore = true)
    @Mapping(target = "idVerificarSolicitud", source = "idVerificarSolicitud")  
    @Mapping(target = "estadoVerificacion", ignore = true)  
    @Mapping(target = "idPerfilTutor", source = "idPerfilTutor")  
    @Mapping(target = "tutorVerificado", ignore = true) 
    UsuarioDTO entityToDto(Usuario entity);
    Usuario dtoToEntity(UsuarioDTO dto);
    List<UsuarioDTO> entitiesToDtos(List<Usuario> entities);
    List<Usuario> dtosToEntities(List<UsuarioDTO> dtos);
    void updateEntityFromDto(UsuarioDTO dto, @MappingTarget Usuario entity);
}