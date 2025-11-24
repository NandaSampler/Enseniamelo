<<<<<<< HEAD
# ---------- Build stage ----------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -e -DskipTests clean package

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
=======
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
>>>>>>> 83d1bee673970f18c85502e3aead1f414d1c48db
