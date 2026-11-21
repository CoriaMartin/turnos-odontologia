# Descripción General

## Stack tecnológico

| Capa | Tecnologías | Versión mínima |
|---|---|---|
| Backend | Java, Spring Boot (Web, Data JPA, Validation, Security, Mail) | Java 21, Spring Boot 3.3 |
| Build backend | Maven (wrapper `mvnw` incluido) | 3.9 |
| Base de datos | PostgreSQL con extensión `btree_gist` | 15 |
| Migraciones | Flyway | 10 |
| Autenticación | Spring Security + JWT (jjwt), BCrypt | — |
| Tests backend | JUnit 5, AssertJ, Mockito, Spring Boot Test, MockMvc | — |
| Frontend | React, TypeScript, Vite | React 18, TS 5, Vite 5 |
| Frontend libs | React Router, TanStack Query | — |
| Tests frontend | Vitest, Testing Library | — |
| Email | SMTP real (Gmail o Brevo) vía `JavaMailSender` | — |
| Entorno | Instalación local (sin Docker) | Node 20 |

## Arquitectura general

```
┌──────────────────────┐   HTTPS/JSON + JWT   ┌───────────────────────────┐   JDBC   ┌──────────────┐
│ Frontend SPA         │ ───────────────────▶ │ Backend Spring Boot       │ ───────▶ │ PostgreSQL   │
│ React + TS (Vite)    │ ◀─────────────────── │ API REST + reglas dominio │ ◀─────── │ + btree_gist │
└──────────────────────┘                      │ @Scheduled recordatorios  │          └──────────────┘
                                              └─────────────┬─────────────┘
                                                            │ SMTP (TLS)
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ Proveedor email  │
                                                   └──────────────────┘
```

- **SPA + API separadas**: el frontend consume la API REST; el backend no renderiza vistas.
- **Monolito modular** en el backend: un único desplegable organizado por módulos de negocio (agenda, pacientes, prestaciones, auth, notificaciones).
- **Doble garantía de no solapamiento**: validación en el servicio de dominio y restricción de exclusión en PostgreSQL. Ver [DD-03](09_decisiones_y_supuestos.md).
- **Recordatorios** por tarea programada dentro del mismo backend; no hay colas ni workers externos.

## Integraciones externas

| Servicio | Propósito | Tipo | Obligatorio en MVP |
|---|---|---|---|
| Proveedor SMTP (Gmail o Brevo) | Enviar recordatorios a pacientes | SMTP con TLS | Sí |

WhatsApp, Mercado Pago, ARCA y calendarios externos están fuera del MVP ([01](01_vision_y_objetivos.md)).

## API REST

Prefijo `/api`. Todas las rutas requieren JWT salvo `POST /api/auth/login`.

| Recurso | Endpoints principales |
|---|---|
| Auth | `POST /auth/login` |
| Prestaciones | `GET /prestaciones`, `POST /prestaciones`, `PUT /prestaciones/{id}`, `PATCH /prestaciones/{id}/activa` |
| Pacientes | `GET /pacientes?q=`, `GET /pacientes/{id}`, `POST /pacientes`, `PUT /pacientes/{id}`, `DELETE /pacientes/{id}` (baja lógica) |
| Turnos | `GET /turnos?desde=&hasta=`, `GET /turnos/{id}`, `POST /turnos`, `PUT /turnos/{id}/reprogramacion`, `POST /turnos/{id}/cancelacion`, `POST /turnos/{id}/asistencia` |
| Configuración | `GET /configuracion`, `PUT /configuracion` |
| Notificaciones | `GET /turnos/{id}/notificaciones` |

Errores con formato uniforme (RFC 7807, `application/problem+json`) y un `codigo` de negocio, por ejemplo `TURNO_SOLAPADO`, `TURNO_EN_PASADO`, `TRANSICION_INVALIDA`.
