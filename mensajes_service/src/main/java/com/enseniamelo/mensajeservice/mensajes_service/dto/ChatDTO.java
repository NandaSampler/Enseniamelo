package com.enseniamelo.mensajeservice.mensajes_service.dto;

import java.sql.Time;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class ChatDTO {
    @Schema(description = "Identificador del chat", example = "1")
    private Long id;

    @NotBlank(message = "La hora es obligatoria")
    @Schema(description = "Hora de creación del chat", example = "12:30:00")
    private Time creado;

    @NotBlank(message = "La hora es obligatoria")
    @Schema(description = "Hora de cierre del chat", example = "12:30:00")
    private Time cerrado;

    public ChatDTO() {}

    public ChatDTO(Long id, Time creado, Time cerrado) {
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

    public Time getCreado() {
        return creado;
    }

    public void setCreado(Time creado) {
        this.creado = creado;
    }

    public Time getCerrado() {
        return cerrado;
    }

    public void setCerrado(Time cerrado) {
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
