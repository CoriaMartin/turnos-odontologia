# Proposal

## Why

Todavía no existe código: ningún change de dominio (core-models, auth, turnos) puede arrancar sin un backend que compile, se conecte a PostgreSQL, aplique migraciones y tenga un formato de errores común. C-01 es el primer eslabón del camino crítico de [CHANGES.md](../../../CHANGES.md) y lo hace el líder en la tanda 1 para destrabar al resto del equipo.

## What Changes

- Nuevo proyecto `backend/` con Maven wrapper, Java 21 y Spring Boot 3.3 (Web, Data JPA, Validation, Security, Mail, Actuator), Flyway y driver PostgreSQL.
- Estructura de paquetes por módulo de negocio (`agenda`, `pacientes`, `prestaciones`, `auth`, `notificaciones`, `configuracion`, `shared`), vacíos salvo `shared`.
- Configuración por variables de entorno (`DB_URL`, `DB_USER`, `DB_PASSWORD`) y perfil `test` contra la base local `turnos_test` (`TEST_DB_URL`).
- `shared`: reloj inyectable (`java.time.Clock`, zona `America/Argentina/Buenos_Aires`) y manejador global de errores que responde Problem Details (RFC 7807) con un campo `codigo` de negocio.
- Primera migración Flyway `V1__extensiones.sql` que habilita `btree_gist` (requisito de la restricción de exclusión de C-07).
- Seguridad temporal: `/actuator/health` público; el resto de la API queda abierto hasta C-04, que la protege con JWT.
- `.env.example` sin secretos, `.gitignore` del backend y sección de instalación en el `README.md` raíz (bases `turnos` y `turnos_test`).
- Tests: el contexto arranca contra `turnos_test` con la migración aplicada, health responde 200 y el manejador devuelve el formato de error acordado.

Fuera de alcance: entidades y tablas de dominio (C-03), autenticación (C-04), frontend (C-02), CI.

## Capabilities

### New Capabilities
- `api-errors`: formato uniforme de las respuestas de error de la API (Problem Details con `codigo` de negocio), que reutilizarán todos los changes posteriores.
- `service-health`: endpoint público que informa si el servicio y su base de datos están operativos, sin exponer detalles internos.

### Modified Capabilities
- Ninguna (no hay specs previas).

## Impact

- Código nuevo en `backend/` y archivos raíz `.env.example`, `README.md`; se amplía `.gitignore`.
- Dependencias nuevas: Spring Boot 3.3 y starters, Flyway, driver PostgreSQL.
- Entorno de cada integrante: JDK 21 y PostgreSQL ≥ 15 con bases `turnos` y `turnos_test` creadas a mano (sin Docker, [DD-06](../../../knowledge-base/09_decisiones_y_supuestos.md)).
- Desbloquea C-03 (core-models) y, a través de él, todo el backend.
