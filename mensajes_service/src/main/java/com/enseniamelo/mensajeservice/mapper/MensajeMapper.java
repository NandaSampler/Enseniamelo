package com.enseniamelo.mensajeservice.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.models.Mensaje;

@Mapper(componentModel = "spring")
public interface MensajeMapper {
    @Mapping(target = "mensajeId", source = "mensajeId")
    @Mapping(target = "contenido", source = "contenido")
    @Mapping(target = "estado", source = "estado")
    @Mapping(target = "fecha", source = "fecha")
    @Mapping(target = "hora", source = "hora")
    @Mapping(target = "chatId", source = "chatId")

    MensajeDTO toDto(Mensaje mensaje);

    Mensaje toEntity(MensajeDTO mensajeDTO);

    List<MensajeDTO> entitiesToDtos(List<Mensaje> mensajes);

    List<Mensaje> dtosToEntities(List<MensajeDTO> mensajeDTOs);

    void updateEntityFromDto(MensajeDTO mensajeDTO, @MappingTarget Mensaje mensaje);
}
