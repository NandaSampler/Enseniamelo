package com.enseniamelo.usuarios.controller;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
public class UsuariosControllerTest {

    @Autowired
    private WebTestClient client;

    @Test
    void contextLoads() {
    }

    @Test
    void getUsuarios() {
        client.get().uri("/api/usuarios")
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3) 
            .jsonPath("$[0].nombre").isEqualTo("Juan Pérez");
    }

    @Test
    void getUsuarioById() {
        int usuarioId = 1;

        client.get().uri("/api/usuarios/{id}", usuarioId)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(usuarioId)
            .jsonPath("$.email").isEqualTo("juan.perez@email.com");
    }

    @Test
    void getUsuarioNotFound() {
        int usuarioIdNotFound = 99;

        client.get().uri("/api/usuarios/{id}", usuarioIdNotFound)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.error").isEqualTo("Not Found")
            .jsonPath("$.message").isEqualTo("Usuario with id=" + usuarioIdNotFound + " not found");
    }

    @Test
    void getUsuarioInvalidParameterString() {
        client.get().uri("/api/usuarios/no-integer")
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
    void getUsuarioInvalidParameterNegative() {
        int usuarioIdNegative = -1;

        client.get().uri("/api/usuarios/{id}", usuarioIdNegative)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isBadRequest()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.path").isEqualTo("/api/usuarios/" + usuarioIdNegative)
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.error").isEqualTo("Bad Request")
            .jsonPath("$.message").isEqualTo("must be greater than or equal to 1");
    }
}
