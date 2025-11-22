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
