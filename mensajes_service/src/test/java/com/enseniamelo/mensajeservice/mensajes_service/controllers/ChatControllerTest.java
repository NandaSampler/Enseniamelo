package com.enseniamelo.mensajeservice.mensajes_service.controllers;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = RANDOM_PORT)
public class ChatControllerTest {
    
    @Autowired
    private WebTestClient client;

    @Test
    void getChatById(){
        int chatId = 1;

        client.get()
            .uri("api/chats/{id}", chatId)
            .accept(APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader()
            .contentType(APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id").isEqualTo(chatId);
    }

    @Test
    void getChatInvalidParameterString() {
    client.get()
        .uri("/api/chats/no-integer")
        .accept(APPLICATION_JSON)
        .exchange()
        .expectStatus().isBadRequest()
        .expectHeader().contentType(APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.status").isEqualTo(400)
        .jsonPath("$.error").isEqualTo("Bad Request")
        .jsonPath("$.message").isEqualTo("Type mismatch.");
    }
}
