FROM maven:3.9.9-eclipse-temurin-17 AS build

LABEL maintainer="Enseniamelo Team"
LABEL description="Usuarios Service con MongoDB y Kafka"
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests
RUN ls -lh target/*.jar
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Enseniamelo Team"
LABEL description="Usuarios Service Runtime"
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xmx768m -Xms384m" \
    SERVER_PORT=8081
EXPOSE 8081
RUN addgroup -g 1001 spring && \
    adduser -D -u 1001 -G spring spring && \
    chown -R spring:spring /app
USER spring:spring
HEALTHCHECK --interval=20s --timeout=10s --start-period=60s --retries=15 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]