package com.enseniamelo.mensajeservice.dto;

import java.time.LocalDateTime;

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

    @Schema(
        description = "Identificador del mensaje",
        example = "692852a8a9c1a01030b7509e",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotNull(message = "El campo 'id_chat' es obligatorio")
    @Schema(
        description = "ID del chat asociado (ObjectId como string)",
        example = "6928529a9c1a01030b7508c1"
    )
    private String id_chat;

    @NotNull(message = "El campo 'remitente' es obligatorio")
    @Schema(
        description = "ID del usuario remitente (ObjectId como string)",
        example = "69272ece5f18lbfe9f03860"
    )
    private String remitente;

    @NotBlank(message = "El contenido es obligatorio")
    @Size(min = 1, message = "El contenido debe tener por lo menos 1 caracter")
    @Schema(
        description = "Contenido del mensaje",
        example = "hola quisiera reservar para mañana a las 12 pm"
    )
    private String contenido;

    @Schema(
        description = "Fecha de creación del mensaje",
        example = "2025-11-27T13:31:20.317",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @Schema(
        description = "Fecha de última actualización del mensaje",
        example = "2025-11-27T13:31:20.317",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;
}
