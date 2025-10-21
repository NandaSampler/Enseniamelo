package com.ensenamelo.pagos_service.controller;

import com.ensenamelo.pagos_service.dto.PagoDTO;
import com.ensenamelo.pagos_service.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.*;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Tag(name = "Pagos", description = "${api.payment.tag}")
@RestController
@RequestMapping("/api/payments")
public class PagoController {
    private final PagoService service;
    public PagoController(PagoService service) { this.service = service; }

    @Operation(summary = "${api.payment.get-payments.description}",
               description = "${api.payment.get-payments.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping
    public Flux<PagoDTO> getPayments() { return service.findAll(); }

    @Operation(summary = "${api.payment.get-payment.description}",
               description = "${api.payment.get-payment.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping("/{id}")
    public Mono<PagoDTO> getPaymentById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
