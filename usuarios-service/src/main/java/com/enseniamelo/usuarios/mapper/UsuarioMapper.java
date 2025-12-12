package com.enseniamelo.usuarios.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.usuarios.dto.UsuarioDTO;
import com.enseniamelo.usuarios.model.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    // De entidad -> DTO
    // ❌ Nunca mandamos la contraseña al cliente
    // ❌ Campos que no existen en Usuario (idVerificarSolicitud, idPerfilTutor,
    // estadoVerificacion, tutorVerificado)
    // se marcan como ignore para que MapStruct no se queje.
    @Mapping(target = "contrasenia", ignore = true)
    @Mapping(target = "idVerificarSolicitud", ignore = true)
    @Mapping(target = "estadoVerificacion", ignore = true)
    @Mapping(target = "idPerfilTutor", ignore = true)
    @Mapping(target = "tutorVerificado", ignore = true)
    UsuarioDTO entityToDto(Usuario entity);

    // De DTO -> entidad
    // ✅ Aquí SÍ queremos la contraseña (para luego encriptarla en el service)
    // El resto de campos que no están en el DTO (rolCodigo, documentos, activo,
    // fechaCreacion)
    // se setean en el service, no en el mapper.
    Usuario dtoToEntity(UsuarioDTO dto);

    List<UsuarioDTO> entitiesToDtos(List<Usuario> entities);

    List<Usuario> dtosToEntities(List<UsuarioDTO> dtos);

    // Actualizar entidad existente desde DTO (update)
    // ❌ No tocamos contraseña aquí (tendrás un endpoint de cambio de contraseña
    // aparte si quieres)
    // ❌ No tocamos el id de Mongo
    @Mapping(target = "contrasenia", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(UsuarioDTO dto, @MappingTarget Usuario entity);
}
