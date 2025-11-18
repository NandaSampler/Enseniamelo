FROM maven:3.9.9-eclipse-temurin-17 AS build
LABEL maintainer="Enseniamelo Team"
LABEL description="Eureka Server - Service Discovery"
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests
RUN ls -lh target/*.jar
FROM eclipse-temurin:17-jre-alpine
LABEL maintainer="Enseniamelo Team"
LABEL description="Eureka Server Runtime"
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx512m -Xms256m" \
    SPRING_PROFILES_ACTIVE="default"
EXPOSE 8761
RUN addgroup -g 1001 spring && \
    adduser -D -u 1001 -G spring spring && \
    chown -R spring:spring /app

USER spring:spring
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8761/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]