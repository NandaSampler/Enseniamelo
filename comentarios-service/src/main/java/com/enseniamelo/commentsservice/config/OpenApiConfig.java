package com.enseniamelo.commentsservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI (Swagger) para el microservicio comentarios-service.
 * Lee la información del archivo application-openapi.yml.
 */
@Configuration
public class OpenApiConfig {

    // === Variables cargadas desde application-openapi.yml ===
    @Value("${api.common.title:Comments API}")
    private String title;

    @Value("${api.common.version:1.0.0}")
    private String version;

    @Value("${api.common.description:API para gestionar comentarios de cursos y tutores}")
    private String description;

    // === Bean principal de documentación OpenAPI ===
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
                .url("https://github.com/Ensenamelo-Org/enseniamelo"));
    }
}
