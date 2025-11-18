package com.enseniamelo.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO para el usuario")
public class UsuarioDTO {

    @Schema(description = "Identificador del usuario", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idUsuario;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Schema(description = "Nombre del usuario", example = "Juan", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    @Schema(description = "Apellido del usuario", example = "Pérez", requiredMode = Schema.RequiredMode.REQUIRED)
    private String apellido;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "El teléfono debe contener entre 8 y 15 dígitos")
    @Schema(description = "Teléfono del usuario", example = "+59112345678", requiredMode = Schema.RequiredMode.REQUIRED)
    private String telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Schema(description = "Correo electrónico del usuario", example = "juan.perez@mail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria", groups = OnCreate.class)
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Schema(description = "Contraseña del usuario", example = "claveSegura123", requiredMode = Schema.RequiredMode.REQUIRED, accessMode = Schema.AccessMode.WRITE_ONLY)
    private String contrasenia;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "^(ADMIN|DOCENTE|ESTUDIANTE)$", message = "El rol debe ser ADMIN, DOCENTE o ESTUDIANTE")
    @Schema(description = "Rol del usuario", example = "ESTUDIANTE", allowableValues = {"ADMIN", "DOCENTE", "ESTUDIANTE"}, requiredMode = Schema.RequiredMode.REQUIRED)
    private String rol;

    @Size(max = 255, message = "La URL de la foto no puede superar los 255 caracteres")
    @Schema(description = "URL o nombre del archivo de la foto del usuario", example = "https://example.com/foto.jpg")
    private String foto;

    
    @Schema(description = "ID de la solicitud de verificación (si existe)", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idVerificarSolicitud;

    @Schema(description = "Estado de la solicitud de verificación", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String estadoVerificacion;

    @Schema(description = "ID del perfil de tutor (si es DOCENTE)", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idPerfilTutor;

    @Schema(description = "Indica si el usuario está verificado como tutor", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean tutorVerificado;
    
    @Schema(description = "Fecha de creación", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @Schema(description = "Fecha de última actualización", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;

    public interface OnCreate {}
    public interface OnUpdate {}
}