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
    @Mapping(target = "idUsuario", source = "usuario.idUsuario")
    @Mapping(target = "nombreCompleto", expression = "java(entity.getUsuario() != null ? entity.getUsuario().getNombre() + \" \" + entity.getUsuario().getApellido() : null)")
    @Mapping(target = "email", source = "usuario.email")
    @Mapping(target = "telefono", source = "usuario.telefono")
    @Mapping(target = "foto", source = "usuario.foto")
    @Mapping(target = "idVerificarSolicitud", source = "verificarSolicitud.idVerificar")
    PerfilTutorDTO entityToDto(PerfilTutor entity);
    PerfilTutor dtoToEntity(PerfilTutorDTO dto);
    List<PerfilTutorDTO> entitiesToDtos(List<PerfilTutor> entities);
    void updateEntityFromDto(PerfilTutorDTO dto, @MappingTarget PerfilTutor entity);
}