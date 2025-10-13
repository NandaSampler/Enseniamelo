package com.enseniamelo.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.enseniamelo.usuarios.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(String rol);
    @Query("{ 'nombre': { $regex: ?0, $options: 'i' } }")
    List<Usuario> findByNombreLike(String nombreParcial); 
    @Query("{ 'rol': { $in: ?0 } }")
    List<Usuario> findByRoles(List<String> roles);
}
