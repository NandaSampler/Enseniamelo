package com.enseniamelo.commentsservice.exception;

public class ResourceNotFoundException extends RuntimeException {
    private final String resource;
    private final Object identifier;

    public ResourceNotFoundException(String resource, Object identifier) {
        super(String.format("%s with id %s not found", resource, identifier));
        this.resource = resource;
        this.identifier = identifier;
    }

    public String getResource() { return resource; }
    public Object getIdentifier() { return identifier; }
}
