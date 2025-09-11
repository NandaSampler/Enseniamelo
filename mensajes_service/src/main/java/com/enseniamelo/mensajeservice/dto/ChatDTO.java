package com.enseniamelo.mensajeservice.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "DTO para los chats")
@Builder
public class ChatDTO {
    @Schema(description = "Identificador del chat", example = "1")
    private Long id;

    @NotBlank(message = "La hora es obligatoria")
    @Schema(description = "Hora de creación del chat", example = "12:30:00")
    private Long creado;

    @NotBlank(message = "La hora es obligatoria")
    @Schema(description = "Hora de cierre del chat", example = "12:30:00")
    private Long cerrado;

    public ChatDTO() {}

    public ChatDTO(Long id, Long creado, Long cerrado) {
        this.id = id;
        this.creado = creado;
        this.cerrado = cerrado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCreado() {
        return creado;
    }

    public void setCreado(Long creado) {
        this.creado = creado;
    }

    public Long getCerrado() {
        return cerrado;
    }

    public void setCerrado(Long cerrado) {
        this.cerrado = cerrado;
    }

    @Override
    public String toString() {
        return "ChatDTO{" +
                "id=" + id +
                ", creado=" + creado +
                ", cerrado=" + cerrado +
                '}';
    }
}
