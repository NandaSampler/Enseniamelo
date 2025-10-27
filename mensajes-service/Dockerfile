# Etapa 1: Construcción con Maven
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar POM y descargar dependencias para aprovechar la caché
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen final ligera para ejecución
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# Copiar el JAR generado desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Configurar variables de entorno útiles
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m" \
    EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ \
    SERVER_PORT=8082

# Exponer el puerto de la aplicación
EXPOSE 8082

# Comando de arranque flexible
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]