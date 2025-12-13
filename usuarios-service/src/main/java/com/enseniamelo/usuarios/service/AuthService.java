package com.enseniamelo.usuarios.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

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
    private final WebClient.Builder webClientBuilder;

    @Value("${keycloak.auth-server-url:http://keycloak:8080}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:enseniamelo-realm}")
    private String realm;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    public Mono<AuthResponse> register(RegisterRequest request) {
        log.debug("Iniciando registro para email: {} con rol: {}", request.getEmail(), request.getRol());

        return usuarioRepository.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("El email ya está registrado"));
                    }
                    String rol = request.getRol();
                    if (rol == null || rol.trim().isEmpty()) {
                        rol = "ESTUDIANTE";
                    }
                    
                    // Normalizar el rol
                    final String rolFinal = normalizarRol(rol);
                    log.debug("Rol normalizado: {}", rolFinal);

                    // 2. Crear usuario en Keycloak con el rol correspondiente
                    return createUserInKeycloak(request, rolFinal)
                            .flatMap(keycloakUserId -> {
                                // 3. Guardar en MongoDB
                                LocalDateTime ahora = LocalDateTime.now();

                                Usuario usuario = new Usuario();
                                usuario.setId(null);
                                usuario.setNombre(request.getNombre());
                                usuario.setApellido(request.getApellido());
                                usuario.setEmail(request.getEmail());
                                usuario.setTelefono(request.getTelefono());
                                usuario.setContrasenia(passwordEncoder.encode(request.getContrasenia()));
                                usuario.setRol(rolFinal);
                                usuario.setRolCodigo(obtenerRolCodigo(rolFinal));
                                usuario.setActivo(true);
                                usuario.setDocumentos(Collections.emptyList());
                                usuario.setFechaCreacion(ahora);
                                usuario.setCreado(ahora);
                                usuario.setActualizado(ahora);

                                return usuarioRepository.save(usuario);
                            })
                            .map(savedUsuario -> {
                                log.info("Usuario registrado exitosamente con rol: {}", savedUsuario.getRol());
                                return new AuthResponse(
                                    savedUsuario.getId(),
                                    null,
                                    savedUsuario.getNombre(),
                                    savedUsuario.getApellido(),
                                    savedUsuario.getEmail(),
                                    savedUsuario.getRol(),
                                    savedUsuario.getFoto(),
                                    "Usuario registrado exitosamente",
                                    null
                                );
                            });
                });
    }

    private String normalizarRol(String rol) {
        if (rol == null) return "ESTUDIANTE";
        
        String rolUpper = rol.toUpperCase().trim();
        
        // Mapeo de valores del frontend
        return switch (rolUpper) {
            case "DOCENTE", "TUTOR" -> "TUTOR";
            case "ADMIN", "ADMINISTRADOR" -> "ADMIN";
            default -> "ESTUDIANTE";
        };
    }

    private Integer obtenerRolCodigo(String rol) {
        return switch (rol) {
            case "ADMIN" -> 3;
            case "TUTOR" -> 2;
            default -> 1; 
        };
    }

    private String obtenerKeycloakRole(String rol) {
        return switch (rol) {
            case "ADMIN" -> "ADMIN";
            case "TUTOR" -> "TUTOR";
            default -> "USER"; 
        };
    }

    private Mono<String> createUserInKeycloak(RegisterRequest request, String rol) {
        log.debug("Creando usuario en Keycloak: {} con rol: {}", request.getEmail(), rol);
        
        return getAdminToken()
                .flatMap(adminToken -> {
                    WebClient webClient = webClientBuilder.build();

                    Map<String, Object> keycloakUser = new HashMap<>();
                    keycloakUser.put("username", request.getEmail());
                    keycloakUser.put("email", request.getEmail());
                    keycloakUser.put("firstName", request.getNombre());
                    keycloakUser.put("lastName", request.getApellido());
                    keycloakUser.put("enabled", true);
                    keycloakUser.put("emailVerified", false);
                    
                    Map<String, Object> credential = new HashMap<>();
                    credential.put("type", "password");
                    credential.put("value", request.getContrasenia());
                    credential.put("temporary", false);
                    keycloakUser.put("credentials", List.of(credential));

                    String usersUrl = String.format("%s/admin/realms/%s/users", 
                            keycloakServerUrl, realm);

                    return webClient.post()
                            .uri(usersUrl)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(keycloakUser)
                            .retrieve()
                            .onStatus(
                                status -> status.value() == HttpStatus.CONFLICT.value(),
                                response -> Mono.error(new RuntimeException("El usuario ya existe en Keycloak"))
                            )
                            .onStatus(
                                HttpStatusCode::isError,
                                response -> response.bodyToMono(String.class)
                                        .flatMap(body -> {
                                            log.error("Error creando usuario en Keycloak: {}", body);
                                            return Mono.error(new RuntimeException("Error creando usuario en Keycloak: " + body));
                                        })
                            )
                            .toBodilessEntity()
                            .flatMap(response -> {
                                String location = response.getHeaders().getLocation().toString();
                                String userId = location.substring(location.lastIndexOf('/') + 1);
                                log.debug("Usuario creado en Keycloak con ID: {}", userId);
                                
                                // Asignar el rol correspondiente en Keycloak
                                String keycloakRole = obtenerKeycloakRole(rol);
                                return assignRoleToUser(adminToken, userId, keycloakRole)
                                        .thenReturn(userId);
                            });
                });
    }

    private Mono<String> getAdminToken() {
        WebClient webClient = webClientBuilder.build();

        String tokenUrl = String.format("%s/realms/master/protocol/openid-connect/token", 
                keycloakServerUrl);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "password");
        formData.add("client_id", "admin-cli");
        formData.add("username", adminUsername);
        formData.add("password", adminPassword);

        return webClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("access_token"))
                .doOnSuccess(token -> log.debug("Token de admin obtenido exitosamente"))
                .doOnError(error -> log.error("Error obteniendo token de admin: {}", error.getMessage()));
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

    private Mono<Void> assignRoleToUser(String adminToken, String userId, String roleName) {
        log.debug("Asignando rol {} al usuario {}", roleName, userId);
        WebClient webClient = webClientBuilder.build();
        String rolesUrl = String.format("%s/admin/realms/%s/roles/%s", 
                keycloakServerUrl, realm, roleName);

        return webClient.get()
                .uri(rolesUrl)
                .header("Authorization", "Bearer " + adminToken)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(roleData -> {
                    String assignRoleUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm",
                            keycloakServerUrl, realm, userId);

                    return webClient.post()
                            .uri(assignRoleUrl)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(List.of(roleData))
                            .retrieve()
                            .toBodilessEntity()
                            .then()
                            .doOnSuccess(v -> log.debug("Rol {} asignado exitosamente", roleName))
                            .doOnError(error -> log.error("Error asignando rol: {}", error.getMessage()));
                });
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