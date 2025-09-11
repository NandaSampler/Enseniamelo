package com.enseniamelo.commentsservice.exception;

/**
 * Excepción personalizada para representar cuando un recurso no es encontrado.
 * 
 * Ejemplo: lanzar cuando no existe un comentario, curso o tutor solicitado.
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resource;
    private final Object identifier;

    /**
     * Constructor principal.
     *
     * @param resource   Nombre del recurso (ej: "Comentario", "Curso", "Tutor").
     * @param identifier Identificador asociado (ej: id numérico, código, etc.).
     */
    public ResourceNotFoundException(String resource, Object identifier) {
        super(String.format("%s with id %s not found", resource, identifier));
        this.resource = resource;
        this.identifier = identifier;
    }

    /**
     * Constructor alternativo solo con mensaje personalizado.
     *
     * @param message Mensaje de error a mostrar.
     */
    public ResourceNotFoundException(String message) {
        super(message);
        this.resource = "Unknown";
        this.identifier = "Unknown";
    }

    public String getResource() {
        return resource;
    }

    public Object getIdentifier() {
        return identifier;
    }
}
