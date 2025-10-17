package com.enseniamelo.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Schema(description = "DTO para perfil de tutor")
public class PerfilTutorDTO {

    @Schema(description = "Identificador del perfil de tutor", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idTutor;

    @Pattern(regexp = "^[0-9]{7,12}$", message = "El CI debe tener entre 7 y 12 dígitos")
    @Schema(description = "Carnet de identidad del tutor", example = "12345678")
    private String ci;

    @Schema(description = "Indica si el tutor está verificado", example = "true", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean verificado;

    @Min(value = 0, message = "La clasificación mínima es 0")
    @Max(value = 5, message = "La clasificación máxima es 5")
    @Schema(description = "Clasificación del tutor (0-5)", example = "4.5", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Float clasificacion;

    @Size(max = 500, message = "La biografía no puede superar los 500 caracteres")
    @Schema(description = "Biografía profesional del tutor", example = "Experto en matemáticas con 10 años de experiencia")
    private String biografia;

    @Schema(description = "ID del usuario asociado", example = "12345", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idUsuario;

    @Schema(description = "Nombre completo del tutor", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombreCompleto;

    @Schema(description = "Email del tutor", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String email;

    @Schema(description = "Teléfono del tutor", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String telefono;

    @Schema(description = "Foto del tutor", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String foto;

    @Schema(description = "ID de la solicitud de verificación", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer idVerificarSolicitud;

    @Schema(description = "Fecha de creación del perfil", example = "2025-10-15T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creacion;

    @Schema(description = "Fecha de última actualización", example = "2025-10-15T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;
}