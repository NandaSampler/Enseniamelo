package main.java.com.enseniamelo.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {
    
    @GetMapping("/mensajes")
    public Mono<Map<String, String>> mensajesFallback() {
        return Mono.just(Map.of(
                "error", "Servicio de mensajes no disponible",
                "message", "Por favor, intente más tarde"
        ));
    }
}