package com.enseniamelo.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.enseniamelo.usuarios.model.PerfilTutor;
import com.enseniamelo.usuarios.model.Usuario;

public interface PerfilTutorRepository extends MongoRepository<PerfilTutor, String> {
    Optional<PerfilTutor> findByIdTutor(Integer idTutor);
    boolean existsByIdTutor(Integer idTutor);
    Optional<PerfilTutor> findByUsuario(Usuario usuario);
    boolean existsByUsuario(Usuario usuario);
    List<PerfilTutor> findByVerificado(Boolean verificado);
    List<PerfilTutor> findByClasificacionGreaterThanEqual(Float clasificacionMinima);
    List<PerfilTutor> findByVerificadoAndClasificacionGreaterThanEqual(Boolean verificado, Float clasificacionMinima);
    long countByVerificado(Boolean verificado);
    void deleteByIdTutor(Integer idTutor);
    @Query("{ 'usuario.$id': ?0 }")
    Optional<PerfilTutor> findByUsuarioId(String usuarioMongoId);
}