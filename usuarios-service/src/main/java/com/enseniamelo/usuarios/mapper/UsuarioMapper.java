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
    @Mapping(target = "idVerificarSolicitud", source = "verificarSolicitud.idVerificar")
    @Mapping(target = "estadoVerificacion", source = "verificarSolicitud.estado")
    @Mapping(target = "idPerfilTutor", source = "perfilTutor.idTutor")
    @Mapping(target = "tutorVerificado", source = "perfilTutor.verificado")
    UsuarioDTO entityToDto(Usuario entity);
    Usuario dtoToEntity(UsuarioDTO dto);
    List<UsuarioDTO> entitiesToDtos(List<Usuario> entities);
    List<Usuario> dtosToEntities(List<UsuarioDTO> dtos);
    void updateEntityFromDto(UsuarioDTO dto, @MappingTarget Usuario entity);
}