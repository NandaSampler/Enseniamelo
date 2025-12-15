package com.enseniamelo.mensajeservice.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO para los chats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {

    @Schema(
        description = "Identificador del chat",
        example = "6928529a9c1a01030b7508c1",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotEmpty(message = "El campo 'participantes' no puede estar vacío")
    @Schema(
        description = "Lista de IDs de usuarios participantes (ObjectId como string)",
        example = "[\"69272ece5f18lbfe9f03860\", \"69273c94255856093cddb381\"]"
    )
    private List<String> participantes;

    @NotNull(message = "El campo 'id_curso' no puede ser nulo")
    @Schema(
        description = "ID del curso asociado (ObjectId como string)",
        example = "69285221a9c1a01030b75018"
    )
    @JsonProperty("id_curso")
    private String idCurso;

    @Schema(
        description = "Último mensaje del chat",
        example = "Hola estoy interesado"
    )
    private String ultimoMensaje;

    @Schema(
        description = "Fecha de creación del chat",
        example = "2025-11-27T13:30:58.531",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @Schema(
        description = "Fecha de última actualización del chat",
        example = "2025-11-27T22:59:34.831",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;

    public String getIdCurso() {
        return idCurso;
    }

    public List<String> getParticipantes() {
        return participantes;
    }
}
