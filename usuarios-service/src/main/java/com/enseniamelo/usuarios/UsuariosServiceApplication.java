package com.enseniamelo.usuarios;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mapping.context.MappingContext;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.index.ReactiveIndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoPersistentEntity;
import org.springframework.data.mongodb.core.mapping.MongoPersistentProperty;

import com.enseniamelo.usuarios.model.Usuario;

@SpringBootApplication
@ComponentScan({ "com.enseniamelo.usuarios", "bo.edu.ucb.microservices.util" })
public class UsuariosServiceApplication {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsuariosServiceApplication.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UsuariosServiceApplication.class, args);

        String mongoUri = ctx.getEnvironment().getProperty("spring.data.mongodb.uri");
        if (mongoUri != null && mongoUri.contains("@")) {
            String sanitizedUri = mongoUri.replaceAll("(?<=//)(.*)(?=@)", "****");
            LOGGER.info("Connected to MongoDB Atlas using URI: {}", sanitizedUri);
        } else if (mongoUri != null) {
            LOGGER.info("Connected to MongoDB at: {}", mongoUri);
        } else {
            LOGGER.warn("MongoDB connection details not found in environment.");
        }
    }

    @Autowired
    private ReactiveMongoOperations reactiveMongoTemplate;

    @EventListener(ContextRefreshedEvent.class)
    public void initIndicesAfterStartup() {

        MappingContext<? extends MongoPersistentEntity<?>, MongoPersistentProperty> mappingContext = 
                reactiveMongoTemplate.getConverter().getMappingContext();
        IndexResolver resolver = new MongoPersistentEntityIndexResolver(mappingContext);

        ReactiveIndexOperations indexOps = reactiveMongoTemplate.indexOps(Usuario.class);
        resolver.resolveIndexFor(Usuario.class).forEach(indexDefinition -> 
            indexOps.ensureIndex(indexDefinition).subscribe()
        );
    }
}