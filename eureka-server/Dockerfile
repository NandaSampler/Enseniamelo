# ==========================
# FASE DE CONSTRUCCIÓN (Maven)
# ==========================
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# compila rápido y sin tests
RUN mvn -q -e -DskipTests clean package


# ==========================
# FASE DE EXTRACCIÓN DE CAPAS
# ==========================
FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /extracted

# Tomamos el jar generado en la fase de build
ARG JAR_FILE=/app/target/*.jar
COPY --from=build ${JAR_FILE} app.jar

# Extraer las capas del jar
RUN java -Djarmode=layertools -jar app.jar extract


# ==========================
# FASE DE EJECUCIÓN
# ==========================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /application

# curl útil para healthchecks desde dentro si algún día lo necesitas
RUN apk add --no-cache curl

# Crear usuario no root para ejecutar la app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar las capas generadas en la fase de build
COPY --from=builder /extracted/dependencies/ ./ 
COPY --from=builder /extracted/spring-boot-loader/ ./ 
COPY --from=builder /extracted/snapshot-dependencies/ ./ 
COPY --from=builder /extracted/application/ ./ 

EXPOSE 8761

ENTRYPOINT ["java", "-cp", "/application", "org.springframework.boot.loader.launch.JarLauncher"]
