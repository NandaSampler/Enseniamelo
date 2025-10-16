package com.enseniamelo.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.enseniamelo.usuarios.model.VerificarSolicitud;
import com.enseniamelo.usuarios.model.Usuario;

public interface VerificarSolicitudRepository extends MongoRepository<VerificarSolicitud, String> {
    Optional<VerificarSolicitud> findByIdVerificar(Integer idVerificar);
    boolean existsByIdVerificar(Integer idVerificar);
    Optional<VerificarSolicitud> findByUsuario(Usuario usuario);
    boolean existsByUsuario(Usuario usuario);
    List<VerificarSolicitud> findByEstado(String estado);
    long countByEstado(String estado);
    void deleteByIdVerificar(Integer idVerificar);
    @Query("{ 'usuario.$id': ?0 }")
    Optional<VerificarSolicitud> findByUsuarioId(String usuarioMongoId);
    @Query("{ 'usuario.$id': ?0 }")
    boolean existsByUsuarioId(String usuarioMongoId);
}