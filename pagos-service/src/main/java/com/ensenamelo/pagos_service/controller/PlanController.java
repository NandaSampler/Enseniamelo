package com.ensenamelo.pagos_service.controller;

import com.ensenamelo.pagos_service.dto.PlanDTO;
import com.ensenamelo.pagos_service.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.*;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Tag(name = "Planes", description = "${api.plan.tag}")
@RestController
@RequestMapping("/api/plans")
public class PlanController {
    private final PlanService service;
    public PlanController(PlanService service) { this.service = service; }

    @Operation(summary = "${api.plan.get-plans.description}",
               description = "${api.plan.get-plans.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping
    public Flux<PlanDTO> getPlans() { return service.findAll(); }

    @Operation(summary = "${api.plan.get-plan.description}",
               description = "${api.plan.get-plan.notes}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "${api.responseCodes.ok.description}"),
        @ApiResponse(responseCode = "400", description = "${api.responseCodes.badRequest.description}"),
        @ApiResponse(responseCode = "404", description = "${api.responseCodes.notFound.description}")
    })
    @GetMapping("/{id}")
    public Mono<PlanDTO> getPlanById(@PathVariable @Min(1) Long id) {
        return service.findById(id);
    }
}
