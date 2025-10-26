package com.enseniamelo.usuarios.service;

import com.enseniamelo.usuarios.dto.AuthResponse;
import com.enseniamelo.usuarios.dto.LoginRequest;
import com.enseniamelo.usuarios.dto.RegisterRequest;
import com.enseniamelo.usuarios.model.Usuario;
import com.enseniamelo.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

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
                
                return generarNuevoIdUsuario()
                    .flatMap(nuevoIdUsuario -> {
                        Usuario usuario = new Usuario();
                        usuario.setIdUsuario(nuevoIdUsuario);
                        usuario.setNombre(request.getNombre());
                        usuario.setApellido(request.getApellido());
                        usuario.setEmail(request.getEmail());
                        usuario.setTelefono(request.getTelefono());
                        usuario.setContrasenia(passwordEncoder.encode(request.getContrasenia()));
                        usuario.setRol("ESTUDIANTE"); // Rol por defecto
                        usuario.setCreado(LocalDateTime.now());
                        usuario.setActualizado(LocalDateTime.now());
                        
                        return usuarioRepository.save(usuario);
                    })
                    .map(savedUsuario -> new AuthResponse(
                        savedUsuario.getId(),
                        savedUsuario.getIdUsuario(),
                        savedUsuario.getNombre(),
                        savedUsuario.getApellido(),
                        savedUsuario.getEmail(),
                        savedUsuario.getRol(),
                        savedUsuario.getFoto(),
                        "Usuario registrado exitosamente",
                        null
                    ));
            });
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
                        updatedUsuario.getIdUsuario(),
                        updatedUsuario.getNombre(),
                        updatedUsuario.getApellido(),
                        updatedUsuario.getEmail(),
                        updatedUsuario.getRol(),
                        updatedUsuario.getFoto(),
                        "Login exitoso",
                        null 
                    ));
            });
    }
    public Mono<AuthResponse> getUserById(String userId) {
        log.debug("Buscando usuario con id: {}", userId);
        return usuarioRepository.findById(userId)
            .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
            .map(usuario -> new AuthResponse(
                usuario.getId(),
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getFoto(),
                "Usuario encontrado",
                null
            ));
    }
    private Mono<Integer> generarNuevoIdUsuario() {
        return usuarioRepository.findAll()
            .filter(u -> u.getIdUsuario() != null)
            .collectList()
            .map(usuarios -> {
                if (usuarios.isEmpty()) {
                    return 1; // Primer usuario
                }
                return usuarios.stream()
                    .mapToInt(Usuario::getIdUsuario)
                    .max()
                    .orElse(0) + 1;
            });
    }
}