package com.enseniamelo.mensajeservice.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO para los mensajes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeDTO {

    @Schema(description = "Identificador del mensaje", example = "1asfsfwe231", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "El campo 'mensajeId' no puede ser nulo")
    @Schema(description = "Identificador del mensaje", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Integer mensajeId;

    @NotBlank(message = "El contenido es obligatorio")
    @Size(min = 1, message = "El contenido debe tener por lo menos 1 caracter")
    @Schema(description = "Contenido del mensaje", example = "Hola, este es un mensaje.", accessMode = Schema.AccessMode.READ_ONLY)
    private String contenido;

    @NotBlank(message = "El estado es obligatorio")
    @Schema(description = "Estado del mensaje", example = "ENVIADO", accessMode = Schema.AccessMode.READ_ONLY)
    private String estado;

    @NotNull(message = "La fecha es obligatoria")
    @Schema(description = "Fecha del mensaje", example = "2023-03-15", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    @Schema(description = "Hora del mensaje", example = "12:30:00", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalTime hora;

    @NotNull(message = "El chatId es obligatorio")
    @Schema(description = "Identificador del chat asociado al mensaje", example = "1174had781hajks123", accessMode = Schema.AccessMode.READ_ONLY)
    private String chatId;
}