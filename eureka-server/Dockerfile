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
