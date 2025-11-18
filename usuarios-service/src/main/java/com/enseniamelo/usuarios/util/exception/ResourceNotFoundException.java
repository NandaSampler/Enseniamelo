package com.enseniamelo.usuarios.util.exception;

public class ResourceNotFoundException extends RuntimeException {
    private final String resource;
    private final Object key;

    public ResourceNotFoundException(String resource, Object key) {
        super(resource + " no encontrado(a) con id=" + key);
        this.resource = resource;
        this.key = key;
    }

    public String getResource() {
        return resource;
    }

    public Object getKey() {
        return key;
    }
}