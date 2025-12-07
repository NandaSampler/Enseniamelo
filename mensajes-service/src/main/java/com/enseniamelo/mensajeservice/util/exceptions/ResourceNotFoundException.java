<<<<<<<< HEAD:usuarios-service/src/main/java/com/enseniamelo/usuarios/util/exception/ResourceNotFoundException.java
package com.enseniamelo.usuarios.util.exception;
========
package com.enseniamelo.mensajeservice.util.exceptions;
>>>>>>>> origin/domBranch:mensajes-service/src/main/java/com/enseniamelo/mensajeservice/util/exceptions/ResourceNotFoundException.java

public class ResourceNotFoundException extends RuntimeException {
    private final String resource;
    private final Object key;

    public ResourceNotFoundException(String resource, Object key) {
        super(resource + " no encontrado con id=" + key);
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