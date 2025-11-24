# Fase de construcción
FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /extracted
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
RUN java -Djarmode=layertools -jar app.jar extract
FROM eclipse-temurin:21-jre-alpine
WORKDIR /application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder extracted/dependencies/ ./
COPY --from=builder extracted/spring-boot-loader/ ./
COPY --from=builder extracted/snapshot-dependencies/ ./
COPY --from=builder extracted/application/ ./

EXPOSE 8081

ENTRYPOINT ["java", "-cp","/application","org.springframework.boot.loader.launch.JarLauncher"]