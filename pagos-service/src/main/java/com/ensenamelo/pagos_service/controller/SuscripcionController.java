package com.ensenamelo.pagos_service.controller;

import com.ensenamelo.pagos_service.dto.SuscripcionDTO;
import com.ensenamelo.pagos_service.service.SuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.*;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Tag(name = "Suscripciones", description = "${api.subscription.tag}")
@RestController
@RequestMapping("/api/subscriptions")
public class SuscripcionController {
    private final SuscripcionService service;
    public SuscripcionController(SuscripcionService service) { this.service = service; }

    @Operation(summary = "${api.subscription.get-subscriptions.description}",
               description = "${api.subscription.get-subscriptions.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping
    public Flux<SuscripcionDTO> getSubscriptions() { return service.findAll(); }

    @Operation(summary = "${api.subscription.get-subscription.description}",
               description = "${api.subscription.get-subscription.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping("/{id}")
    public Mono<SuscripcionDTO> getSubscriptionById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
