package com.enseniamelo.usuarios.controller;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
public class RolControllerTest {

    @Autowired
    private WebTestClient client;

    @Test
    void contextLoads() {
    }

    @Test
    void getAllRoles() {
        client.get().uri("/api/roles")
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3)  // cantidad inicial esperada de roles
            .jsonPath("$[0].rolUsuario").isEqualTo("ADMIN_USER")
            .jsonPath("$[0].rolTutor").isEqualTo("ADMIN_TUTOR");
    }

    @Test
    void getRolById() {
        int rolId = 1;

        client.get().uri("/api/roles/{id}", rolId)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(rolId)
            .jsonPath("$.rolUsuario").isEqualTo("ADMIN_USER")
            .jsonPath("$.rolTutor").isEqualTo("ADMIN_TUTOR");
    }

    @Test
    void getRolNotFound() {
        int rolIdNotFound = 99;

        client.get().uri("/api/roles/{id}", rolIdNotFound)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.error").isEqualTo("Not Found")
            .jsonPath("$.message").isEqualTo("Rol with id=" + rolIdNotFound + " not found");
    }

    @Test
    void getRolInvalidParameterString() {
        client.get().uri("/api/roles/no-integer")
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
    void getRolInvalidParameterNegative() {
        int rolIdNegative = -1;

        client.get().uri("/api/roles/{id}", rolIdNegative)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isBadRequest()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.path").isEqualTo("/api/roles/" + rolIdNegative)
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.error").isEqualTo("Bad Request")
            .jsonPath("$.message").isEqualTo("must be greater than or equal to 1");
    }
}
