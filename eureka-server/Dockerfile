<<<<<<< HEAD
# ---------- Build stage ----------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# compila rápido y sin tests
RUN mvn -q -e -DskipTests clean package

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
# copia el jar resultante (usa wildcard)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8761
ENTRYPOINT ["java","-jar","/app/app.jar"]
=======
# Fase de construcción
FROM eclipse-temurin:21-jre-alpine as builder
WORKDIR /extracted

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Extraer las capas del jar
RUN java -Djarmode=layertools -jar app.jar extract

# Fase de ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /application

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

ENTRYPOINT ["java", "-cp","/application","org.springframework.boot.loader.launch.JarLauncher"]
>>>>>>> 83d1bee673970f18c85502e3aead1f414d1c48db
