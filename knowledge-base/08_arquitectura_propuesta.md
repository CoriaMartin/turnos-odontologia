# Arquitectura Propuesta

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| Monolito modular por feature | Backend: paquetes `agenda`, `pacientes`, `prestaciones`, `auth`, `notificaciones`, `configuracion` | Un desplegable simple con límites claros entre dominios |
| Capas por módulo (`domain`, `application`, `infrastructure`, `web`) | Cada módulo del backend | Reglas de negocio testeables con JUnit puro, sin Spring ni base de datos |
| Reloj inyectable (`java.time.Clock`) | Reglas de pasado, cancelación tardía, recordatorios | Tests deterministas de bordes temporales |
| Puerto/adaptador para email (`EnviadorEmail`) | Notificaciones | SMTP real en ejecución; doble de prueba en tests (nunca se envían emails reales desde tests) |
| Restricción en base de datos | Tabla `turno` (exclusión gist) | Garantiza no solapamiento ante concurrencia ([DD-03](09_decisiones_y_supuestos.md)) |
| Bloqueo optimista (`@Version`) | Turno | Evita pisar ediciones concurrentes |
| Problem Details (RFC 7807) | `@RestControllerAdvice` global | Errores uniformes con código de negocio |
| Migraciones versionadas | Flyway | Esquema reproducible, incluye extensiones y restricciones |

## Estructura de directorios

```
turnos-odontologia/
├── backend/
│   ├── pom.xml, mvnw
│   └── src/
│       ├── main/java/ar/edu/turnosodonto/
│       │   ├── agenda/{domain,application,infrastructure,web}/
│       │   ├── pacientes/...
│       │   ├── prestaciones/...
│       │   ├── auth/...
│       │   ├── notificaciones/...
│       │   ├── configuracion/...
│       │   └── shared/ (errores, reloj, seguridad)
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/ (V1__...sql)
│       └── test/java/... (unit: domain sin Spring; integración: @SpringBootTest contra turnos_test)
├── frontend/
│   ├── package.json, vite.config.ts
│   └── src/
│       ├── features/{agenda,pacientes,prestaciones,auth,configuracion}/
│       ├── shared/ (api client, componentes, hooks)
│       └── pages/
├── knowledge-base/
├── openspec/
├── discovery/
├── .env.example
└── README.md
```

## Seguridad

- **Autenticación**: login con email y contraseña (BCrypt); JWT firmado HS256 con vencimiento de 8 h. Sin refresh token en el MVP.
- **Autorización**: Spring Security, rol `ODONTOLOGO` en todas las rutas salvo login y health.
- **Validación de input**: Bean Validation en DTOs y reglas de dominio en servicios; el frontend valida para usabilidad, nunca como única barrera.
- **Secrets management**: variables de entorno. `.env` en `.gitignore`; solo `.env.example` sin valores reales se versiona.
- **CORS**: solo el origen del frontend configurado.
- **Logs**: sin datos personales de pacientes (RN-DS-03).
- **Transporte**: HTTPS en cualquier despliegue fuera de `localhost`; SMTP con TLS.

## Estrategia de tests

| Nivel | Herramienta | Qué cubre | Requiere |
|---|---|---|---|
| Unitario de dominio | JUnit 5 + AssertJ | Solapamiento, estados, cancelación tardía, bordes temporales | Nada (corre en cualquier máquina) |
| Integración | Spring Boot Test + MockMvc | Endpoints, persistencia, restricción de exclusión, concurrencia | PostgreSQL local con base `turnos_test` |
| Frontend | Vitest + Testing Library | Componentes de agenda y formularios | Node |

Cada escenario de `openspec/specs` debe tener al menos un test. Sin Docker, los tests de integración dependen de que el README explique cómo crear `turnos_test` ([IN-04](10_preguntas_abiertas.md)).

## Variables de entorno

| Variable | Descripción | Ejemplo | Sensible |
|---|---|---|---|
| `DB_URL` | JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/turnos` | N |
| `DB_USER` | Usuario de base | `turnos` | N |
| `DB_PASSWORD` | Contraseña de base | — | Y |
| `TEST_DB_URL` | JDBC de la base de tests | `jdbc:postgresql://localhost:5432/turnos_test` | N |
| `JWT_SECRET` | Clave de firma (≥ 32 bytes) | — | Y |
| `JWT_EXP_MINUTES` | Vencimiento del token | `480` | N |
| `ADMIN_EMAIL` | Email del odontólogo inicial | `odontologo@example.com` | N |
| `ADMIN_PASSWORD` | Contraseña inicial | — | Y |
| `MAIL_HOST` | Servidor SMTP | `smtp-relay.brevo.com` | N |
| `MAIL_PORT` | Puerto SMTP | `587` | N |
| `MAIL_USERNAME` | Usuario SMTP | — | Y |
| `MAIL_PASSWORD` | Contraseña o clave de app SMTP | — | Y |
| `MAIL_FROM` | Remitente | `turnos@example.com` | N |
| `MAIL_ENABLED` | Habilita el envío real | `false` | N |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` | N |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:8080/api` | N |
