package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Chat;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {
    
}
