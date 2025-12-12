package com.enseniamelo.usuarios.controller;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
class VerificarSoliControllerTests {

    @Autowired
    private WebTestClient client;

    @Test
    void contextLoads() {
    }

    @Test
    void getAllVerificaciones() {
        client.get().uri("/api/verificaciones")
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3) // cantidad esperada
            .jsonPath("$[0].estado").isEqualTo("APROBADO")
            .jsonPath("$[0].comentario").isEqualTo("Solicitud aceptada sin observaciones");
    }

    @Test
    void getVerificacionById() {
        int verificacionId = 1;

        client.get().uri("/api/verificaciones/{id}", verificacionId)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(verificacionId)
            .jsonPath("$.estado").isEqualTo("APROBADO")
            .jsonPath("$.comentario").isEqualTo("Solicitud aceptada sin observaciones");
    }

    @Test
    void getVerificacionNotFound() {
        int verificacionIdNotFound = 99;

        client.get().uri("/api/verificaciones/{id}", verificacionIdNotFound)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.error").isEqualTo("Not Found")
            .jsonPath("$.message").isEqualTo("Verificación with id=" + verificacionIdNotFound + " not found");
    }

    @Test
    void getVerificacionInvalidParameterString() {
        client.get().uri("/api/verificaciones/no-integer")
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isBadRequest()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.error").isEqualTo("Bad Request")
            .jsonPath("$.message").isEqualTo("Type mismatch.");
    }

    @Test
    void getVerificacionInvalidParameterNegative() {
        int verificacionIdNegative = -1;

        client.get().uri("/api/verificaciones/{id}", verificacionIdNegative)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isBadRequest()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.path").isEqualTo("/api/verificaciones/" + verificacionIdNegative)
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.error").isEqualTo("Bad Request")
            .jsonPath("$.message").isEqualTo("must be greater than or equal to 1");
    }
}
