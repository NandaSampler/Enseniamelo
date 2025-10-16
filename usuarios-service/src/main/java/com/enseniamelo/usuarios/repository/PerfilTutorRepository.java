package com.enseniamelo.usuarios.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.enseniamelo.usuarios.model.PerfilTutor;

public interface PerfilTutorRepository extends MongoRepository<PerfilTutor, String> {
    Optional<PerfilTutor> findByIdTutor(Integer idTutor);
    Optional<PerfilTutor> findByUsuarioIdUsuario(Integer idUsuario);
    boolean existsByUsuarioIdUsuario(Integer idUsuario);
}