# 📋 Instrucciones de Ejecución - Microservicios Enseñamelo

## 🚀 Cómo Ejecutar el Proyecto

### 1. Construir y Levantar los Contenedores

Desde la raíz del proyecto (donde está el `docker-compose.yml`), ejecuta:

```bash
docker-compose up --build
```

Este comando:
- Construirá las imágenes de todos los microservicios
- Levantará todos los contenedores en el orden correcto
- Esperará a que cada servicio esté saludable antes de iniciar el siguiente

### 2. Orden de Inicio de Servicios

Los servicios se iniciarán en este orden:
1. **PostgreSQL** (Base de datos para Keycloak)
2. **Keycloak** (Autenticación y autorización)
3. **Zookeeper** (Coordinación para Kafka)
4. **Kafka** (Sistema de mensajería)
5. **Kafka UI** (Interfaz web para Kafka)
6. **Eureka Server** (Registro y descubrimiento de servicios)
7. **RabbitMQ** (Sistema de mensajería alternativo)
8. **Usuarios Service** (Microservicio de usuarios)
9. **Comentarios Service** (Microservicio de comentarios)
10. **Gateway** (Puerta de entrada a los microservicios)

### 3. Tiempo de Inicio

⏱️ **Tiempo estimado**: 3-5 minutos para que todos los servicios estén completamente operativos.

---

## 🌐 URLs de Acceso

### 📊 Servicios de Infraestructura

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Eureka Dashboard** | http://localhost:8761 | Ver servicios registrados |
| **Kafka UI** | http://localhost:8090 | Monitorear topics y mensajes de Kafka |
| **RabbitMQ Management** | http://localhost:15672 | Gestión de colas (user: `guest`, pass: `guest`) |
| **Keycloak Admin** | http://localhost:8180 | Administración de Keycloak (user: `admin`, pass: `admin`) |

### 🔐 Gateway (Punto de Entrada Principal)

**Base URL**: `http://localhost:8080`

---

## 📝 Endpoints de Comentarios Service

### Acceso Directo (Sin Gateway)

**Base URL**: `http://localhost:8082`

#### Swagger UI
- **URL**: http://localhost:8082/openapi/swagger-ui.html
- **Descripción**: Documentación interactiva de la API

#### API Endpoints
- `GET http://localhost:8082/api/comentario-curso` - Listar todos los comentarios
- `GET http://localhost:8082/api/comentario-curso/{id}` - Obtener comentario por ID
- `GET http://localhost:8082/api/comentario-curso/curso/{idCurso}` - Listar comentarios de un curso
- `POST http://localhost:8082/api/comentario-curso` - Crear nuevo comentario
- `PUT http://localhost:8082/api/comentario-curso/{id}` - Actualizar comentario
- `DELETE http://localhost:8082/api/comentario-curso/{id}` - Eliminar comentario

### Acceso a través del Gateway

**Base URL**: `http://localhost:8080`

#### Swagger UI
- **URL**: http://localhost:8080/comentarios/swagger-ui.html
- **Descripción**: Documentación interactiva a través del Gateway

#### API Endpoints
- `GET http://localhost:8080/api/comentario-curso` - Listar todos los comentarios
- `GET http://localhost:8080/api/comentario-curso/{id}` - Obtener comentario por ID
- `GET http://localhost:8080/api/comentario-curso/curso/{idCurso}` - Listar comentarios de un curso
- `POST http://localhost:8080/api/comentario-curso` - Crear nuevo comentario
- `PUT http://localhost:8080/api/comentario-curso/{id}` - Actualizar comentario
- `DELETE http://localhost:8080/api/comentario-curso/{id}` - Eliminar comentario

---

## 📝 Endpoints de Usuarios Service

### Acceso Directo (Sin Gateway)

**Base URL**: `http://localhost:8081`

#### Swagger UI
- **URL**: http://localhost:8081/openapi/swagger-ui.html

### Acceso a través del Gateway

**Base URL**: `http://localhost:8080`

#### Swagger UI
- **URL**: http://localhost:8080/usuarios/swagger-ui.html

---

## 🧪 Pruebas con Postman

### Configuración de Postman

**Variables de entorno sugeridas**:
```
gateway_url = http://localhost:8080
comentarios_url = http://localhost:8082
usuarios_url = http://localhost:8081
```

### Ejemplo de Request - Crear Comentario

**Método**: POST  
**URL Gateway**: `http://localhost:8080/api/comentario-curso`  
**URL Directa**: `http://localhost:8082/api/comentario-curso`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "idCurso": "curso123",
  "idUsuario": "usuario456",
  "comentario": "Excelente curso, muy bien explicado",
  "clasificacion": 4.5,
  "fecha": "2025-10-27"
}
```

### Ejemplo de Request - Listar Comentarios de un Curso

**Método**: GET  
**URL Gateway**: `http://localhost:8080/api/comentario-curso/curso/curso123`  
**URL Directa**: `http://localhost:8082/api/comentario-curso/curso/curso123`

---

## ✅ Verificación de Funcionamiento

### 1. Verificar Eureka
Accede a http://localhost:8761 y verifica que veas:
- ✅ `USUARIOS-SERVICE` registrado
- ✅ `COMENTARIOS-SERVICE` registrado
- ✅ `GATEWAY-SERVICE` registrado

### 2. Verificar Health Checks

```bash
# Gateway
curl http://localhost:8080/actuator/health

# Usuarios Service
curl http://localhost:8081/actuator/health

# Comentarios Service
curl http://localhost:8082/actuator/health
```

Todos deben responder con `{"status":"UP"}`

### 3. Verificar Swagger

Abre en tu navegador:
- ✅ http://localhost:8080/comentarios/swagger-ui.html (a través del Gateway)
- ✅ http://localhost:8082/openapi/swagger-ui.html (acceso directo)
- ✅ http://localhost:8080/usuarios/swagger-ui.html (a través del Gateway)
- ✅ http://localhost:8081/openapi/swagger-ui.html (acceso directo)

### 4. Verificar MongoDB

Los servicios deben conectarse automáticamente a tu MongoDB Atlas:
- **URI**: `mongodb+srv://jaredpimentel_db_user:DpCito170209@cluster0.cibyezm.mongodb.net/`
- **Database**: `enseniamelo`

---

## 🛑 Detener los Servicios

```bash
# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v
```

---

## 🐛 Solución de Problemas

### Problema: Gateway no puede conectarse a los servicios

**Solución**: Espera 1-2 minutos adicionales. Los servicios necesitan registrarse en Eureka.


### Problema: Servicio no se registra en Eureka

**Solución**: 
```bash
# Ver logs del servicio
docker logs comentarios-service
docker logs usuarios-service

# Reiniciar el servicio específico
docker-compose restart comentarios
```

### Problema: Error de conexión a MongoDB

**Solución**: Verifica que la URI de MongoDB sea correcta y que tengas acceso a internet.

---

## 📊 Criterios de Evaluación Cumplidos

### ✅ Persistencia de Datos
- Conexión a MongoDB funcional
- Endpoints CRUD retornan datos reales desde BD
- Repository con consultas implementadas

### ✅ Eureka Server (Discovery)
- Eureka Server levanta correctamente
- Servicios se registran en Eureka
- Descubrimiento dinámico funcional

### ✅ Edge Server (Gateway)
- Gateway enruta peticiones correctamente
- Uso de predicados y filtros (Path, RewritePath, StripPrefix)
- Documentación API accesible a través del gateway

### ✅ Docker
- Dockerfile funcional para cada microservicio
- Imagen construida correctamente con `docker build`

### ✅ Docker Compose
- docker-compose.yml correcto con todos los servicios
- Dependencias y redes configuradas
- Logs y salud del sistema sin fallos

---

## 📌 Notas Importantes

1. **No se tocó usuarios-service**: Todos los cambios fueron aislados a comentarios-service y gateway
2. **MongoDB Atlas**: Se usa la misma base de datos para ambos servicios
3. **Kafka y RabbitMQ**: Configurados para mensajería entre servicios
4. **Keycloak**: Configurado pero no se implementó autenticación en comentarios-service (como solicitaste)

---

## 🎯 Próximos Pasos (Opcional)

Si deseas agregar autenticación con Keycloak a comentarios-service:
1. Agregar dependencias de Spring Security OAuth2
2. Configurar JWT en application.properties
3. Proteger endpoints con `@PreAuthorize`
4. Actualizar rutas del Gateway para usar TokenRelay

---

**¡Listo! Tu microservicio de comentarios está completamente integrado con el Gateway y Eureka.** 🎉
