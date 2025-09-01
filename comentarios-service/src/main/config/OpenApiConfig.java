package com.enseniamelo.commentsservice.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;

@Configuration
public class OpenApiConfig {

    @Value("${api.common.title:Comments API}")
    private String title;

    @Value("${api.common.version:1.0.0}")
    private String version;

    @Value("${api.common.description:API para gestionar comentarios de cursos y tutores}")
    private String description;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title(title)
                .version(version)
                .description(description)
                .license(new License().name("MIT").url("https://opensource.org/licenses/MIT"))
                .contact(new Contact().name("Equipo Enseñamelo").email("soporte@enseniamelo.example"))
            )
            .externalDocs(new ExternalDocumentation().description("Repositorio").url("https://example.com/enseniamelo"));
    }
}
