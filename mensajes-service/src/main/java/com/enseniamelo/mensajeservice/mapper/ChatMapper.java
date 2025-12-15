package com.enseniamelo.mensajeservice.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.mensajeservice.dto.ChatDTO;
import com.enseniamelo.mensajeservice.models.Chat;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    // ========= ENTITY → DTO =========
    @Mapping(target = "participantes",
            expression = "java(objectIdListToStringList(chat.getParticipantes()))")
    @Mapping(target = "idCurso",
            expression = "java(objectIdToString(chat.getIdCurso()))")
    ChatDTO toDto(Chat chat);

    // ========= DTO → ENTITY =========
    @Mapping(target = "participantes",
            expression = "java(stringListToObjectIdList(chatDTO.getParticipantes()))")
    @Mapping(target = "idCurso",
            expression = "java(stringToObjectId(chatDTO.getIdCurso()))")
    @Mapping(target = "creado", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    Chat toEntity(ChatDTO chatDTO);

    // ========= LISTS =========
    List<ChatDTO> entitiesToDtos(List<Chat> chats);
    List<Chat> dtosToEntities(List<ChatDTO> chats);

    // ========= UPDATE =========
    @Mapping(target = "participantes",
            expression = "java(stringListToObjectIdList(chatDTO.getParticipantes()))")
    @Mapping(target = "idCurso",
            expression = "java(stringToObjectId(chatDTO.getIdCurso()))")
    @Mapping(target = "creado", ignore = true)
    @Mapping(target = "actualizado", ignore = true)
    void updateEntityFromDto(ChatDTO chatDTO, @MappingTarget Chat chat);

    // ========= HELPERS =========
    default String objectIdToString(ObjectId id) {
        return id != null ? id.toHexString() : null;
    }

    default ObjectId stringToObjectId(String id) {
        return (id != null && !id.isBlank()) ? new ObjectId(id) : null;
    }

    default List<String> objectIdListToStringList(Collection<ObjectId> list) {
        if (list == null) return null;
        return list.stream()
                .filter(Objects::nonNull)
                .map(ObjectId::toHexString)
                .toList();
    }

    default List<ObjectId> stringListToObjectIdList(Collection<String> list) {
        if (list == null) return null;
        return list.stream()
                .filter(Objects::nonNull)
                .filter(str -> !str.isBlank())
                .map(ObjectId::new)
                .toList();
    }
}