package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.dto.UsuarioDTO;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    @Mapping(target = "serviceAddress", ignore = true)
    UsuarioDTO entityToDto(Usuario entity);
    Usuario dtoToEntity(UsuarioDTO dto);
}
