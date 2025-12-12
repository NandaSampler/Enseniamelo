# ==========================
# FASE 1: BUILD CON MAVEN
# ==========================
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

# Copiamos pom y código fuente
COPY pom.xml .
COPY src ./src

# Compilamos el proyecto y generamos el JAR
RUN mvn -q clean package -DskipTests


# ==========================
# FASE 2: EXTRAER CAPAS DEL JAR
# ==========================
FROM eclipse-temurin:21-jre-alpine AS builder

WORKDIR /extracted

# Tomamos el jar generado en la fase anterior
ARG JAR_FILE=/workspace/target/*.jar
COPY --from=build ${JAR_FILE} app.jar

# Usamos layertools para extraer las capas
RUN java -Djarmode=layertools -jar app.jar extract


# ==========================
# FASE 3: RUNTIME
# ==========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /application

# Crear usuario no root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiamos las capas extraídas
COPY --from=builder /extracted/dependencies/ ./ 
COPY --from=builder /extracted/spring-boot-loader/ ./ 
COPY --from=builder /extracted/snapshot-dependencies/ ./ 
COPY --from=builder /extracted/application/ ./ 

EXPOSE 8081

# Puedes usar con o sin -cp; esta es la forma típica:
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
# Si quieres mantener el estilo del otro:
# ENTRYPOINT ["java", "-cp","/application","org.springframework.boot.loader.launch.JarLauncher"]
