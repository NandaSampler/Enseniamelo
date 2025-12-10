package com.enseniamelo.mensajeservice.dto;


import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "Identificador del chat", example = "1agaj21hj1h3", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotNull(message = "El campo 'creado' no puede ser nulo")
    @Schema(description = "Fecha de la creación del chat", example = "2023-03-15", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate fechaCreacion;

    @NotNull(message = "El campo 'usuarioEmisor' no puede ser nulo")
    @Schema(description = "Id del usuario emisor del chat", example = "1dsfa1231bas", accessMode = Schema.AccessMode.READ_ONLY)
    private String usuario_emisor;

    @NotNull(message = "El campo 'usuarioReceptor' no puede ser nulo")
    @Schema(description = "Id del suario receptor del chat", example = "2dsfq123acxza", accessMode = Schema.AccessMode.READ_ONLY)
    private String usuario_receptor;
}
