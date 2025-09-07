package com.enseniamelo.usuarios.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "DTO para verificar una solicitud")
public class VerificarSoliDTO {

    @Schema(description = "Identificador de la solicitud", example = "101")
    private Long id;

    @NotBlank(message = "El estado es obligatorio")
    @Schema(description = "Estado de la solicitud", example = "APROBADO")
    private String estado;

    @Size(max = 250, message = "El comentario no puede superar los 250 caracteres")
    @Schema(description = "Comentario de verificación", example = "La solicitud cumple con los requisitos")
    private String comentario;

    public VerificarSoliDTO() {}

    public VerificarSoliDTO(Long id, String estado, String comentario) {
        this.id = id;
        this.estado = estado;
        this.comentario = comentario;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getComentario() {
        return comentario;
    }
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    @Override
    public String toString() {
        return "VerificarSoliDTO [id=" + id + ", estado=" + estado + ", comentario=" + comentario + "]";
    }
}
