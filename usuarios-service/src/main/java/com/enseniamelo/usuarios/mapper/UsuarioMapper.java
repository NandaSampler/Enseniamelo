package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.dto.UsuarioDTO;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    UsuarioDTO entityToDto(Usuario entity);
    Usuario dtoToEntity(UsuarioDTO dto);
}
