package com.enseniamelo.usuarios.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "DTO para solicitud de verificación de curso de tutor")
public class VerificarSolicitudDTO {

    @Schema(description = "ID de MongoDB de la solicitud", example = "507f1f77bcf86cd799439033", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @Schema(description = "Estado de la solicitud", example = "PENDIENTE", allowableValues = { "PENDIENTE", "APROBADO",
            "RECHAZADO" }, accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String estado;

    @Size(max = 250)
    private String comentario;

    @NotBlank(message = "La foto del CI es obligatoria", groups = CreateSolicitud.class)
    @Pattern(regexp = "^(https?://|data:image/|/curso/uploads/).*", message = "Debe ser una URL válida", groups = CreateSolicitud.class)
    @Size(max = 500)
    private String fotoCi;

    @Schema(description = "Lista de archivos adicionales del curso (URLs)")
    private List<String> archivos;

    @Schema(description = "ID de MongoDB del curso", example = "507f1f77bcf86cd799439044")
    private String idCurso;

    @Schema(description = "ID de MongoDB del usuario solicitante", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idUsuario;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String nombreUsuario;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String emailUsuario;

    @Schema(description = "ID de MongoDB del perfil de tutor", example = "507f1f77bcf86cd799439022", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String idPerfilTutor;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime decidido;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;

    public interface CreateSolicitud {
    }

    public interface UpdateDecision {
    }
}