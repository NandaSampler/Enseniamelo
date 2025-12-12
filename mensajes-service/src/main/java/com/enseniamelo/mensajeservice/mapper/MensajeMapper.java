package com.enseniamelo.mensajeservice.mapper;

import java.util.List;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.mensajeservice.dto.MensajeDTO;
import com.enseniamelo.mensajeservice.models.Mensaje;

@Mapper(componentModel = "spring")
public interface MensajeMapper {

    // ========== ENTITY → DTO ==========
    @Mapping(target = "id_chat",
             expression = "java(objectIdToString(mensaje.getId_chat()))")
    @Mapping(target = "remitente",
             expression = "java(objectIdToString(mensaje.getRemitente()))")
    // creado y actualizado se asignan solos
    MensajeDTO toDto(Mensaje mensaje);

    // ========== DTO → ENTITY ==========
    @Mapping(target = "id_chat",
             expression = "java(stringToObjectId(mensajeDTO.getId_chat()))")
    @Mapping(target = "remitente",
             expression = "java(stringToObjectId(mensajeDTO.getRemitente()))")
    @Mapping(target = "creado", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    Mensaje toEntity(MensajeDTO mensajeDTO);

    List<MensajeDTO> entitiesToDtos(List<Mensaje> mensajes);
    List<Mensaje> dtosToEntities(List<MensajeDTO> mensajes);

    @Mapping(target = "id_chat",
             expression = "java(stringToObjectId(mensajeDTO.getId_chat()))")
    @Mapping(target = "remitente",
             expression = "java(stringToObjectId(mensajeDTO.getRemitente()))")
    @Mapping(target = "creado", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    void updateEntityFromDto(MensajeDTO mensajeDTO, @MappingTarget Mensaje mensaje);

    // ==== helpers ====

    default String objectIdToString(ObjectId id) {
        return id != null ? id.toHexString() : null;
    }

    default ObjectId stringToObjectId(String id) {
        return (id != null && !id.isBlank()) ? new ObjectId(id) : null;
    }
}
