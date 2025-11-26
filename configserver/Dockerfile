# =========================
# Etapa de build
# =========================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /workspace

# Copiamos el pom para resolver dependencias (cacheable)
COPY pom.xml .

# Copiamos el código fuente
COPY src ./src

# Compilamos el proyecto y generamos el JAR
RUN mvn -q clean package -DskipTests

# =========================
# Etapa de runtime
# =========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /application

# Utilidades útiles (curl para pruebas/healthcheck)
RUN apk add --no-cache curl

# Usuario no root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiamos el jar construido en la etapa anterior
COPY --from=builder /workspace/target/configserver-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]
