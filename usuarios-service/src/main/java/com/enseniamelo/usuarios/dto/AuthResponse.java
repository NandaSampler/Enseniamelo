package com.enseniamelo.usuarios.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO de respuesta de autenticación")
public class AuthResponse {
    
    @Schema(description = "ID de MongoDB del usuario", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;
    
    @Schema(description = "Identificador numérico del usuario", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idUsuario;
    
    @Schema(description = "Nombre del usuario", example = "Juan", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombre;
    
    @Schema(description = "Apellido del usuario", example = "Pérez", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String apellido;
    
    @Schema(description = "Correo electrónico del usuario", example = "juan.perez@mail.com", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String email;
    
    @Schema(description = "Rol del usuario", example = "ESTUDIANTE", allowableValues = {"ADMIN", "DOCENTE", "ESTUDIANTE"}, accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String rol;
    
    @Schema(description = "URL de la foto del usuario", example = "https://example.com/foto.jpg", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String foto;
    
    @Schema(description = "Mensaje de respuesta", example = "Login exitoso", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String message;
    
    @Schema(description = "Token JWT (si se usa autenticación con token)", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String token;
    
    public AuthResponse(String id, Integer idUsuario, String nombre, String apellido, String email, String rol, String message) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
        this.message = message;
    }

    public AuthResponse(String message) {
        this.message = message;
    }
}