package com.enseniamelo.usuarios.dto;

import java.time.LocalDateTime;

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

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO para el usuario")
public class UsuarioDTO {

    @Schema(description = "ID de MongoDB del usuario", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotBlank
    @Size(min = 2, max = 50)
    private String nombre;

    @NotBlank
    @Size(min = 2, max = 50)
    private String apellido;

    @NotBlank
    @Pattern(regexp = "^[+]?[0-9]{8,15}$")
    private String telefono;

    @NotBlank
    @Email
    private String email;

    @NotBlank(groups = OnCreate.class)
    @Size(min = 6, max = 100)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String contrasenia;

    @NotBlank
    @Pattern(regexp = "^(ADMIN|DOCENTE|ESTUDIANTE)$")
    private String rol;

    @Size(max = 255)
    private String foto;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idVerificarSolicitud;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String estadoVerificacion;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idPerfilTutor;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean tutorVerificado;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;

    public interface OnCreate {
    }

    public interface OnUpdate {
    }
}