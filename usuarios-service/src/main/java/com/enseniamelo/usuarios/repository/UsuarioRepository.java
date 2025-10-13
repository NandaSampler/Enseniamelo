package com.enseniamelo.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.enseniamelo.usuarios.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByIdUsuario(Integer idUsuario);
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(String rol);
    List<Usuario> findByNombreStartingWith(String prefix);
    List<Usuario> findByTelefonoGreaterThanEqual(Integer telefono);
    @Query("{ 'telefono': { $gte: ?0, $lte: ?1 } }")
    List<Usuario> findUsuariosByTelefonoRange(Integer minTelefono, Integer maxTelefono);
}
