package com.enseniamelo.usuarios.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "DTO para información de curso")
public class CursoDTO {

    @Schema(description = "ID de MongoDB del curso", example = "507f1f77bcf86cd799439044")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @Schema(description = "Nombre del curso", example = "Matemáticas Avanzadas")
    private String nombre;

    @Schema(description = "Título del curso", example = "Curso completo de Cálculo")
    private String titulo;

    @Schema(description = "Descripción del curso")
    private String descripcion;

    @Schema(description = "Modalidad del curso", example = "Virtual")
    private String modalidad;

    @Schema(description = "Precio por hora", example = "50.0")
    private Float precio_reserva;

    @Schema(description = "URL de la portada del curso")
    private String portada_url;

    @Schema(description = "Lista de URLs de fotos del curso")
    private List<String> fotos;

    @Schema(description = "Indica si necesita reserva")
    private Boolean necesitaReserva;

    @Schema(description = "Lista de categorías del curso")
    private List<String> categorias;

    @Schema(description = "ID del tutor (MongoDB)")
    private String idTutor;

    @Schema(description = "Estado de verificación del curso")
    private String verificacion_estado;
    
    @Schema(description = "Estado del curso", example = "activo")
    private String estado;
    
    @Schema(description = "Si el curso está activo")
    private Boolean activo;

    @Schema(description = "Fecha de creación del curso")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime creado;

    @Schema(description = "Fecha de última actualización")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime actualizado;
}