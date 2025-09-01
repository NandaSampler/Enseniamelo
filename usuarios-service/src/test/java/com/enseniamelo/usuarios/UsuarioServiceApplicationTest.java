package com.enseniamelo.usuarios;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
class UsuarioServiceApplicationTests {

    @Autowired
    private WebTestClient client;

    @Test
    void contextLoads() {
    }

    @Test
    void getUsuarios() {
        client.get().uri("/api/usuarios").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3) 
            .jsonPath("$[0].nombre").isEqualTo("Juan Pérez");
    }

    @Test
    void getUsuarioById() {
        client.get().uri("/api/usuarios/1").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
            .jsonPath("$.email").isEqualTo("juan.perez@email.com");
    }

    @Test
    void getUsuarioNotFound() {
        client.get().uri("/api/usuarios/99").accept(APPLICATION_JSON) 
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.message").isEqualTo("Usuario with id=99 not found");
    }
}
