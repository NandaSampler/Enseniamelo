package com.enseniamelo.mensajeservice.mensajes_service.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("api/chats")
@Tag(name = "Chat", description = "API para gestionar los chats")
public class ChatController {
    
}
