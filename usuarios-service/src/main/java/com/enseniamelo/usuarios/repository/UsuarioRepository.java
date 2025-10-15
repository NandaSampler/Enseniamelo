package com.enseniamelo.usuarios.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.enseniamelo.usuarios.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, Integer> {
    Optional<Usuario> findByIdUsuario(Integer idUsuario); 
}