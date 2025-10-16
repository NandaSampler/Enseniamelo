package com.enseniamelo.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO para solicitud de verificación de tutor")
public class VerificarSolicitudDTO {

    @Schema(description = "Identificador de la solicitud", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idVerificar;

    @Schema(description = "Estado de la solicitud", example = "PENDIENTE", allowableValues = {"PENDIENTE", "APROBADO", "RECHAZADO"}, accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String estado;

    @Size(max = 250, message = "El comentario no puede superar los 250 caracteres")
    @Schema(description = "Comentario del administrador sobre la decisión", example = "Documentos válidos")
    private String comentario;

    @NotBlank(message = "La foto del CI es obligatoria")
    @Size(max = 255, message = "La URL de la foto no puede superar los 255 caracteres")
    @Schema(description = "URL de la foto del carnet de identidad", example = "https://example.com/ci.jpg", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fotoCi;


    @Schema(description = "ID del usuario que solicita verificación", example = "12345", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idUsuario;

    @Schema(description = "Nombre completo del usuario", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombreUsuario;

    @Schema(description = "Email del usuario", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String emailUsuario;
    @Schema(description = "ID del perfil de tutor creado (si fue aprobado)", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idPerfilTutor;

    @Schema(description = "Fecha de creación de la solicitud", example = "2025-10-15T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @Schema(description = "Fecha de decisión (aprobación o rechazo)", example = "2025-10-16T14:30:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime decidido;

    @Schema(description = "Fecha de última actualización", example = "2025-10-15T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;
}