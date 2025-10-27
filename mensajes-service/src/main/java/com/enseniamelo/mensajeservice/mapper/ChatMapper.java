package com.enseniamelo.mensajeservice.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.enseniamelo.mensajeservice.dto.ChatDTO;
import com.enseniamelo.mensajeservice.models.Chat;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    @Mapping(target = "fechaCreacion", source = "fechaCreacion")
    @Mapping(target = "usuario_emisor", source = "usuario_emisor")
    @Mapping(target = "usuario_receptor", source = "usuario_receptor")
    
    ChatDTO toDto(Chat chat);

    Chat toEntity(ChatDTO chatDTO);
    
    List<ChatDTO> entitiesToDtos(List<Chat> chats);

    List<Chat> dtosToEntities(List<ChatDTO> chatDTOs);
    
    void updateEntityFromDto(ChatDTO chatDTO, @MappingTarget Chat chat);
}