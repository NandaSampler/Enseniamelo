package com.enseniamelo.usuarios;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
class RolServiceApplicationTests {

    @Autowired
    private WebTestClient client;

    @Test
    void contextLoads() {
    }

    @Test
    void getAllRoles() {
        client.get().uri("/api/roles").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3)
            .jsonPath("$[0].rolUsuario").isEqualTo("ADMIN_USER")
            .jsonPath("$[0].rolTutor").isEqualTo("ADMIN_TUTOR");
    }
    @Test
    void getRolById() {
        client.get().uri("/api/roles/1").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
            .jsonPath("$.rolUsuario").isEqualTo("ADMIN_USER")
            .jsonPath("$.rolTutor").isEqualTo("ADMIN_TUTOR");
    }


    @Test
    void getRolNotFound() {
        client.get().uri("/api/roles/99").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.message").isEqualTo("Rol with id=99 not found");
    }
}
