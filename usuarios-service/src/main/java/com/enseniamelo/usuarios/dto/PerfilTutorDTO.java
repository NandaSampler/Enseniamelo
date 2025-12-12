package com.enseniamelo.usuarios.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO para perfil de tutor")
public class PerfilTutorDTO {

    @Schema(description = "ID de MongoDB del perfil de tutor", example = "507f1f77bcf86cd799439022", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotBlank(groups = UpdateProfile.class)
    @Pattern(regexp = "^[0-9]{7,12}$")
    private String ci;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean verificado;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Float clasificacion;

    @Size(max = 500)
    private String biografia;

    @Schema(description = "ID de MongoDB del usuario asociado", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idUsuario;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombreCompleto;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String email;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String telefono;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String foto;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idVerificarSolicitud;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creacion;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;

    public interface UpdateProfile {
    }

    public interface UpdateRating {
    }
}