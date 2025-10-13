package com.enseniamelo.usuarios.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.dto.UsuarioDTO;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mappings({
        @Mapping(target = "password", ignore = true) 
    })
    UsuarioDTO entityToDto(Usuario entity);

    @Mappings({
        @Mapping(target = "id", ignore = true),      
        @Mapping(target = "password", ignore = true) 
    })
    Usuario dtoToEntity(UsuarioDTO dto);
}
