---

# Tutor Service (WebFlux) — Enseñamelo

Microservicio reactivo para listar tutores y obtener detalles de un tutor por ID. Construido con **Spring Boot 3.x + WebFlux**, validación Jakarta y Lombok. Preparado para evolucionar a R2DBC/PostgreSQL.

---

## Requisitos

* **Java 17 (JDK)**
* **VS Code** con extensiones:

  * Extension Pack for Java (Microsoft)
  * Spring Boot Extension Pack (VMware)
  * Lombok Annotations Support for VS Code
* (Opcional) **Postman** o **Thunder Client** (extensión VS Code) para probar endpoints

> **Nota de consistencia**: usa el mismo **groupId** en el `pom.xml` y el **package base** en las clases.
> Ejemplo usado aquí: `com.ensenamelo.tutorservice`.

---

## 1) Crear el proyecto desde VS Code (Spring Initializr)

1. Abre VS Code → `Ctrl+Shift+P` → escribe **Spring Initializr: Create a Maven Project**.
2. Selecciona:

   * Spring Boot: **versión estable**
   * **Group**: `com.ensenamelo`
   * **Artifact**: `tutor-service`
   * **Name**: `tutor-service`
   * **Package name**: `com.ensenamelo.tutorservice`
   * **Java**: 17
3. Dependencias:

   * **Spring Reactive Web (WebFlux)**
   * **Validation** (`spring-boot-starter-validation`)
   * **Lombok**
   * **(Opcional)** `springdoc-openapi-starter-webflux-ui` para Swagger UI en WebFlux
     *(no uses el starter “webmvc” en proyectos WebFlux)*
4. Elige una carpeta para guardar. VS Code te preguntará si quieres **abrir el proyecto**: di que **sí**.

---

## 2) Estructura de paquetes (paquete base)

Crea estos directorios bajo `src/main/java/com/ensenamelo/tutorservice/`:

```
controller/
dto/
exception/
service/
```

Tu clase principal `TutorServiceApplication.java` debe estar en `com.ensenamelo.tutorservice` con `@SpringBootApplication` (hace **component scan** de todos los subpaquetes).

---

## 3) DTO (Paquete DTO)

`src/main/java/com/ensenamelo/tutorservice/dto/TutorDTO.java`

```java
package com.ensenamelo.tutorservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorDTO {
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String materia;

    @NotBlank
    private String modalidad; // "PRESENCIAL" | "VIRTUAL"

    @NotBlank
    private String ubicacion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal tarifaPorHora;

    private boolean verificado;

    @DecimalMin("0.0") @DecimalMax("5.0")
    private Double rating;
}
```

---

## 4) Servicio REACTIVO (interfaz)

> Con WebFlux usamos **Flux** (stream de muchos elementos) y **Mono** (uno o ninguno).

`src/main/java/com/ensenamelo/tutorservice/service/TutorService.java`

```java
package com.ensenamelo.tutorservice.service;

import com.ensenamelo.tutorservice.dto.TutorDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TutorService {
    Flux<TutorDTO> findAll();
    Mono<TutorDTO> findById(Long id);
}
```

---

## 5) Implementación en memoria (reactiva)

`src/main/java/com/ensenamelo/tutorservice/service/InMemoryTutorService.java`

```java
package com.ensenamelo.tutorservice.service;

import com.ensenamelo.tutorservice.dto.TutorDTO;
import com.ensenamelo.tutorservice.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryTutorService implements TutorService {

    private final Map<Long, TutorDTO> data = new ConcurrentHashMap<>();

    public InMemoryTutorService() {
        data.put(1L, TutorDTO.builder()
                .id(1L).nombre("Ana López").materia("Matemáticas")
                .modalidad("VIRTUAL").ubicacion("La Paz")
                .tarifaPorHora(new BigDecimal("50"))
                .verificado(true).rating(4.7).build());

        data.put(2L, TutorDTO.builder()
                .id(2L).nombre("Carlos Pérez").materia("Física")
                .modalidad("PRESENCIAL").ubicacion("Cochabamba")
                .tarifaPorHora(new BigDecimal("60"))
                .verificado(false).rating(4.2).build());
    }

    @Override
    public Flux<TutorDTO> findAll() {
        // Emitimos todos los tutores como un stream reactivo
        return Flux.fromIterable(data.values());
    }

    @Override
    public Mono<TutorDTO> findById(Long id) {
        TutorDTO t = data.get(id);
        return (t != null)
                ? Mono.just(t)
                : Mono.error(new ResourceNotFoundException("Tutor", id));
    }
}
```

---

## 6) Excepciones (custom + handler global compatible con WebFlux)

`src/main/java/com/ensenamelo/tutorservice/exception/ResourceNotFoundException.java`

```java
package com.ensenamelo.tutorservice.exception;

public class ResourceNotFoundException extends RuntimeException {
    private final String resource;
    private final Object key;

    public ResourceNotFoundException(String resource, Object key) {
        super(resource + " no encontrado(a) con id=" + key);
        this.resource = resource;
        this.key = key;
    }
    public String getResource() { return resource; }
    public Object getKey() { return key; }
}
```

`src/main/java/com/ensenamelo/tutorservice/exception/GlobalExceptionHandler.java`

```java
package com.ensenamelo.tutorservice.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebInputException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(body));
    }

    // Ejemplo: errores de path variables/params inválidos en WebFlux
    @ExceptionHandler(ServerWebInputException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleBadInput(ServerWebInputException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getReason());
        return Mono.just(ResponseEntity.badRequest().body(body));
    }
}
```

---

## 7) Controller REACTIVO (solo GET)

`src/main/java/com/ensenamelo/tutorservice/controller/TutorController.java`

```java
package com.ensenamelo.tutorservice.controller;

import com.ensenamelo.tutorservice.dto.TutorDTO;
import com.ensenamelo.tutorservice.service.TutorService;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorService service;

    public TutorController(TutorService service) {
        this.service = service;
    }

    // GET reactivo que devuelve un Flux<TutorDTO>
    @GetMapping
    public Flux<TutorDTO> getTutors() {
        return service.findAll();
    }

    // GET reactivo que devuelve un Mono<TutorDTO>
    @GetMapping("/{id}")
    public Mono<TutorDTO> getTutorById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
```

> Con WebFlux también podrías usar rutas funcionales (`RouterFunction`/`HandlerFunction`). Aquí usamos anotaciones por simplicidad y escalabilidad inmediata.

---

## 8) Configuración mínima

Usando **`src/main/resources/application.properties`** (recomendado en este proyecto):

```properties
server.port=8081
spring.application.name=tutor-service
spring.main.web-application-type=reactive
spring.jackson.serialization.write-dates-as-timestamps=false
```

> Alternativa en **YAML** si prefieres: crea `application.yml` con las claves equivalentes y evita duplicarlas en `.properties`.

---

## 9) Ejecutar y probar

### Ejecutar (desde la **raíz** del proyecto, donde está `pom.xml`)

* **CMD**:

  ```bat
  mvnw.cmd spring-boot:run
  ```
* **PowerShell**:

  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
* *(o `mvn spring-boot:run` si tienes Maven instalado globalmente)*

Deberías ver: `Netty started on port 8081`

### Probar

* **Todos los tutores**
  `GET http://localhost:8081/api/tutors`
* **Tutor por id**
  `GET http://localhost:8081/api/tutors/1`
* **No encontrado (404)**
  `GET http://localhost:8081/api/tutors/999` → Respuesta JSON de error del `GlobalExceptionHandler`.

---

## 10) ¿Qué hace exactamente *tutor-service*?

* **Microservicio** independiente dentro de **Enseñamelo**.
* **Responsabilidad**: exponer endpoints **GET** para **listar tutores** y **obtener un tutor por id**.
* **Contrato de datos**: `TutorDTO` (nombre, materia, modalidad, ubicación, tarifa, verificado, rating).
* **Modelo de ejecución**: **reactivo/no bloqueante** (WebFlux + Reactor):

  * Maneja muchas solicitudes concurrentes con menos hilos.
  * Facilita componer llamadas a otros microservicios (p. ej., *booking-service* para disponibilidad) sin bloquear.
* **Errores**: si no existe el tutor, lanza `ResourceNotFoundException`; el *advice* global devuelve **404** con cuerpo JSON consistente.
* **Estado actual**: datos **en memoria** para centrarnos en la API. Puedes cambiar la implementación por **R2DBC (PostgreSQL reactivo)** sin tocar el *controller* (solo el *service*).

---

### Notas finales

* **No mezcles** `spring-boot-starter-web` (MVC) con `spring-boot-starter-webflux` (reactivo) en el mismo módulo.
* Si el editor subraya `jakarta.validation` o `lombok`, asegúrate de:

  * Tener las dependencias en `pom.xml`,
  * Ejecutar `Java: Clean Java Language Server Workspace`,
  * Y correr `mvnw.cmd clean compile`.
