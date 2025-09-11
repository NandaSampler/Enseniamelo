package com.enseniamelo.mensajeservice.dto;

import java.util.Date;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Schema(description = "DTO para los mensajes")
@Builder
public class MensajeDTO {

    @Schema(description = "Identificador del mensaje", example = "1")
    private Long id;

    @NotBlank(message = "El texto es obligatorio")
    @Size(min = 1, message = "El texto debe tener por lo menos 1 caracter")
    @Schema(description = "Texto del mensaje", example = "Hola, este es un mensaje.")
    private String texto;

    @NotNull(message = "La hora es obligatoria")
    @Schema(description = "Hora del mensaje", example = "12:30:00")
    private Date hora;

    @NotBlank(message = "El estado es obligatorio")
    @Schema(description = "Estado del mensaje", example = "ENVIADO")
    private String estado;

    public MensajeDTO() {
    }

    public MensajeDTO(Long id, String texto, Date hora, String estado) {
        this.id = id;
        this.texto = texto;
        this.hora = hora;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Date getHora() {
        return hora;
    }

    public void setHora(Date hora) {
        this.hora = hora;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    @Override
    public String toString() {
        return "MensajeDTO{" +
                "id=" + id +
                ", texto='" + texto + '\'' +
                ", hora=" + hora +
                ", estado='" + estado + '\'' +
                '}';
    }
}