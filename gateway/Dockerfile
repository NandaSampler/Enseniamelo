# ===========================
# 🏗️ STAGE 1: Construcción del proyecto
# ===========================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar pom y descargar dependencias (para usar cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente
COPY src ./src

# Compilar y empaquetar el JAR sin tests
RUN mvn clean package -DskipTests

# ===========================
# 🚀 STAGE 2: Imagen final
# ===========================
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copiar el JAR construido desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Variables opcionales para sobreescribir en docker-compose
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""

# Exponer el puerto del Gateway (8080)
EXPOSE 8080

# Healthcheck básico: verifica el estado del actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep '"status":"UP"' || exit 1

# Ejecutar el Gateway con soporte para JAVA_OPTS
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
