package com.enseniamelo.usuarios;

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
        client.get().uri("/api/verificaciones").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3) 
            .jsonPath("$[0].estado").isEqualTo("APROBADO")
            .jsonPath("$[0].comentario").isEqualTo("Solicitud aceptada sin observaciones");
    }

    @Test
    void getVerificacionById() {
        client.get().uri("/api/verificaciones/1").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
            .jsonPath("$.estado").isEqualTo("APROBADO")
            .jsonPath("$.comentario").isEqualTo("Solicitud aceptada sin observaciones");
    }

    @Test
    void getVerificacionNotFound() {
        client.get().uri("/api/verificaciones/99").accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isNotFound()
            .expectHeader().contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.message").isEqualTo("Verificación with id=99 not found");
    }
}
