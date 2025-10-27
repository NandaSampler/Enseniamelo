# ===========================
# 🏗️ STAGE 1: Build del proyecto
# ===========================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ===========================
# 🚀 STAGE 2: Imagen final
# ===========================
FROM eclipse-temurin:17-jdk-alpine
RUN apk add --no-cache curl   # 👈 Importante para el healthcheck
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""

EXPOSE 8082

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
