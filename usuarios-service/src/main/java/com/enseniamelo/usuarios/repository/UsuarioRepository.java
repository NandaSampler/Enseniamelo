package com.enseniamelo.usuarios.repository;


import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;


import com.enseniamelo.usuarios.model.Usuario;
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByIdUsuario(Integer idUsuario);
    boolean existsByIdUsuario(Integer idUsuario);
    boolean existsByEmail(String email);
    void deleteByIdUsuario(Integer idUsuario);

}