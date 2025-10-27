# ---------- Build stage ----------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos el POM primero para cache de dependencias (si usas mvn -am, ajusta aquí)
COPY pom.xml .
# ⚠️ Si quieres cachear deps: RUN mvn -q -e -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -e -DskipTests clean package

# ---------- Runtime stage ----------
# ⚠️ La rama alternativa usaba 'apk', pero esta imagen es Debian/Ubuntu-based.
#     Por eso instalamos curl con apt-get (no apk).
FROM eclipse-temurin:17-jre
WORKDIR /app

# (Opcional) útil para healthchecks o depurar conectividad
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Copiamos el jar generado
COPY --from=build /app/target/*.jar /app/app.jar

# ⚠️ El gateway expone 8443 según application.yml (server.port: 8443 con SSL)
EXPOSE 8443

# (Opcional) Healthcheck HTTPS con cert self-signed; comenta si no lo usas
# HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
#   CMD curl -kfsS https://localhost:8443/actuator/health || exit 1

# Arranque
ENTRYPOINT ["java","-jar","/app/app.jar"]
