package com.enseniamelo.mensajeservice.repository;

import com.enseniamelo.mensajeservice.models.Mensaje;

import java.util.List;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface MensajeRepository extends ReactiveMongoRepository<Mensaje, String> {
}
