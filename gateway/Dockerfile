# ==========================
# FASE DE CONSTRUCCIÓN
# ==========================
FROM eclipse-temurin:21-jre-alpine AS builder

WORKDIR /extracted

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Extraemos las capas del jar
RUN java -Djarmode=layertools -jar app.jar extract


# ==========================
# FASE DE EJECUCIÓN
# ==========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /application

# Crear usuario no root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar capas generadas
COPY --from=builder /extracted/dependencies/ ./
COPY --from=builder /extracted/spring-boot-loader/ ./
COPY --from=builder /extracted/snapshot-dependencies/ ./
COPY --from=builder /extracted/application/ ./

EXPOSE 8443

ENTRYPOINT ["java", "-cp", "/application", "org.springframework.boot.loader.launch.JarLauncher"]
