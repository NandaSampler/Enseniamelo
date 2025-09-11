package com.enseniamelo.mensajeservice.mensajes_service.controllers;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
public class MensajeControllerTest {
    
    @Autowired
    private WebTestClient client;

    @Test
    void getMensajeById(){
        int mensajeId = 1;

        client.get()
            .uri("api/mensajes/{id}", mensajeId)
            .exchange()
            .expectStatus().isOk()
            .expectHeader()
            .contentType("application/json")
            .expectBody()
            .jsonPath("$.id").isEqualTo(mensajeId);
    }

    @Test
    void getMensajeInvalidParameterString() {

        client.get()
            .uri("api/mensajes/no-integer")
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
    void getMensajeNotFound() {
        int mensajeIdNotFound = 999;

        client.get()
            .uri("api/mensajes/{id}", mensajeIdNotFound)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.error").isEqualTo("Not Found")
            .jsonPath("$.message").isEqualTo("Mensaje no encontrado con id=" + mensajeIdNotFound);
    }

    @Test
    void getMensajeInvalidParameterNegative() {
        int mensajeIdNegative = -5;

        client.get()
            .uri("api/mensajes/{id}", mensajeIdNegative)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isBadRequest()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.error").isEqualTo("Bad Request")
            .jsonPath("$.message").isEqualTo("must be greater than or equal to 1");
    }
}
