package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;
import java.util.Collections;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.enseniamelo.usuarios.dto.AuthResponse;
import com.enseniamelo.usuarios.dto.LoginRequest;
import com.enseniamelo.usuarios.dto.RegisterRequest;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Mono<AuthResponse> register(RegisterRequest request) {
        log.debug("Iniciando registro para email: {}", request.getEmail());

        return usuarioRepository.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("El email ya está registrado"));
                    }

                    LocalDateTime ahora = LocalDateTime.now();

                    Usuario usuario = new Usuario();
                    usuario.setId(null); // Mongo genera el _id
                    usuario.setNombre(request.getNombre());
                    usuario.setApellido(request.getApellido());
                    usuario.setEmail(request.getEmail());
                    usuario.setTelefono(request.getTelefono());
                    usuario.setContrasenia(passwordEncoder.encode(request.getContrasenia()));

                    // 🔹 Campos del modelo que antes quedaban “huérfanos”
                    usuario.setRol("ESTUDIANTE"); // valor por defecto
                    usuario.setRolCodigo(1); // 1 = estudiante (según tu comentario)
                    usuario.setActivo(true); // usuario activo al registrarse
                    usuario.setDocumentos(Collections.emptyList()); // sin docs al inicio

                    usuario.setFechaCreacion(ahora);
                    usuario.setCreado(ahora);
                    usuario.setActualizado(ahora);

                    return usuarioRepository.save(usuario);
                })
                .map(savedUsuario -> new AuthResponse(
                        savedUsuario.getId(), // id (Mongo)
                        null, // idUsuario numérico ya NO se usa
                        savedUsuario.getNombre(),
                        savedUsuario.getApellido(),
                        savedUsuario.getEmail(),
                        savedUsuario.getRol(),
                        savedUsuario.getFoto(),
                        "Usuario registrado exitosamente",
                        null // token (si luego lo agregas)
                ));
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        log.debug("Iniciando login para email: {}", request.getEmail());

        return usuarioRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(usuario -> {
                    if (!passwordEncoder.matches(request.getContrasenia(), usuario.getContrasenia())) {
                        return Mono.error(new RuntimeException("Contraseña incorrecta"));
                    }

                    usuario.setActualizado(LocalDateTime.now());

                    return usuarioRepository.save(usuario)
                            .map(updatedUsuario -> new AuthResponse(
                                    updatedUsuario.getId(),
                                    null,
                                    updatedUsuario.getNombre(),
                                    updatedUsuario.getApellido(),
                                    updatedUsuario.getEmail(),
                                    updatedUsuario.getRol(),
                                    updatedUsuario.getFoto(),
                                    "Login exitoso",
                                    null));
                });
    }

    public Mono<AuthResponse> getUserById(String userId) {
        log.debug("Buscando usuario con id: {}", userId);

        return usuarioRepository.findById(userId)
                .switchIfEmpty(Mono.empty())
                .map(usuario -> new AuthResponse(
                        usuario.getId(),
                        null,
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getEmail(),
                        usuario.getRol(),
                        usuario.getFoto(),
                        "Usuario encontrado",
                        null));
    }

    public Mono<AuthResponse> getUserByEmail(String email) {
        log.debug("Buscando usuario por email: {}", email);

        return usuarioRepository.findByEmail(email)
                .switchIfEmpty(Mono.empty())
                .map(usuario -> new AuthResponse(
                        usuario.getId(),
                        null,
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getEmail(),
                        usuario.getRol(),
                        usuario.getFoto(),
                        "Usuario encontrado",
                        null));
    }
}
