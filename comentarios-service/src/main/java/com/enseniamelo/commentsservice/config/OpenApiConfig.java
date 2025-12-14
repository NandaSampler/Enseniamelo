package com.enseniamelo.commentsservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Value("${api.common.title:Comments API}")
    private String title;

    @Value("${api.common.version:1.0.0}")
    private String version;

    @Value("${api.common.description:API para gestionar comentarios de cursos y tutores}")
    private String description;

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI comentariosOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title(title)
                .version(version)
                .description(description)
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"))
                .contact(new Contact()
                        .name("Equipo Enseñamelo")
                        .email("soporte@enseniamelo.bo")
                        .url("https://enseniamelo.bo"))
            )
            .externalDocs(new ExternalDocumentation()
                .description("Documentación del Proyecto Enseñamelo")
                .url("https://github.com/Ensenamelo-Org/enseniamelo"))
            .components(new Components()
                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .in(SecurityScheme.In.HEADER)
                    .name("Authorization")
                    .description("Ingresa tu token JWT (sin el prefijo 'Bearer ')")
                )
            )
            .addSecurityItem(new SecurityRequirement()
                .addList(BEARER_AUTH)
            );
    }
}