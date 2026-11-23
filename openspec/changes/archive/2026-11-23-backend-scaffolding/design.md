# Design

## Context

El repo no tiene código (ver proposal.md). La arquitectura, el stack y las variables de entorno ya están decididos en [knowledge-base/08](../../../knowledge-base/08_arquitectura_propuesta.md) y [02](../../../knowledge-base/02_descripcion_general.md). Restricciones relevantes: Java 21, sin Docker ([DD-06](../../../knowledge-base/09_decisiones_y_supuestos.md)), PostgreSQL local, y las reglas de [AGENTS.md](../../../AGENTS.md) (DTOs + ProblemDetail con `codigo`, tests contra `turnos_test`). Requisitos de comportamiento: specs `api-errors` y `service-health`.

## Goals / Non-Goals

**Goals:**
- Que cualquier integrante clone, cree las bases y corra `./mvnw verify` en verde siguiendo solo el README.
- Dejar fijados los puntos de extensión que los changes siguientes reutilizan: manejador de errores, reloj, configuración de seguridad y numeración de migraciones.

**Non-Goals:**
- Entidades, tablas de dominio, autenticación o endpoints de negocio.
- Pipeline de CI, Dockerfile o despliegue.

## Decisions

### D1 — Generación del proyecto: archivos escritos a mano + Maven Wrapper "only-script"
`pom.xml` con `spring-boot-starter-parent` 3.3.x y wrapper `mvnw`/`mvnw.cmd` de tipo *only-script* (Maven Wrapper 3.3), que descarga Maven 3.9 en el primer uso.
- *Alternativa*: Spring Initializr. Descarta: agrega un paso externo y un `.jar` binario versionado sin aportar nada sobre un pom escrito explícitamente.
- Requiere internet en el primer `./mvnw` (descarga Maven y dependencias).

### D2 — Paquete base y módulos
`ar.edu.turnosodonto` con un paquete por módulo de negocio y, dentro de `shared`, subpaquetes `error`, `time`, `security`. Los módulos de dominio se crean vacíos con un `package-info.java` que documenta su responsabilidad, para que existan en git y cada change sepa dónde ir.

### D3 — Errores: `@RestControllerAdvice` que extiende `ResponseEntityExceptionHandler`
- `spring.mvc.problemdetails.enabled=true` y un `GlobalExceptionHandler` que extiende `ResponseEntityExceptionHandler` para heredar el mapeo estándar de Spring (404, 400, 405, 415) y agregarle `codigo`.
- `NegocioException` (abstracta, unchecked) con `codigo` y `HttpStatus`; cada change define sus subclases (por ejemplo `TurnoSolapadoException`). El handler la traduce a ProblemDetail sin conocer el dominio.
- Validación (`MethodArgumentNotValidException`) → 422 `VALIDACION_FALLIDA` con `errores: [{campo, mensaje}]`; JSON ilegible → 400 `SOLICITUD_INVALIDA`; `Exception` genérica → 500 `ERROR_INTERNO`, se loguea la traza y no se devuelve.
- 404 de rutas inexistentes: `spring.mvc.throw-exception-if-no-handler-found` ya no aplica en Boot 3.2+; se captura `NoResourceFoundException`.
- *Alternativa*: errores con formato propio. Descarta: RFC 7807 es estándar y Spring lo soporta nativamente.

### D4 — Reloj inyectable
Bean `Clock` = `Clock.system(ZoneId.of("America/Argentina/Buenos_Aires"))` en `shared.time.RelojConfig`. Los tests lo reemplazan por `Clock.fixed(...)`. Hibernate configurado con `hibernate.jdbc.time_zone=UTC` para que `timestamptz` se guarde en UTC.

### D5 — Seguridad temporal explícita
`SecurityFilterChain` en `shared.security` que permite `/actuator/health` y, provisoriamente, todo lo demás (`anyRequest().permitAll()`); sin sesión (`STATELESS`), CSRF deshabilitado (API sin cookies), sin login por formulario ni básico, y un `UserDetailsService` vacío para que Spring no genere una contraseña aleatoria. C-04 reemplaza `anyRequest().permitAll()` por autenticación JWT. Se deja comentado como punto de cambio.
- *Ajuste durante apply*: permitir solo `/actuator/health` y `/api/**` hacía que `/actuator/env` respondiera 403 en vez del 404 que exige la spec `service-health`; por eso se abre todo provisoriamente.
- *Alternativa*: excluir Spring Security hasta C-04. Descarta: C-04 cambiaría más archivos y el comportamiento por defecto (login básico con contraseña generada) confunde.

### D6 — Actuator mínimo
`management.endpoints.web.exposure.include=health`, `management.endpoint.health.show-details=never`, `show-components=never`. Cumple el requisito de respuesta mínima y deja `/actuator/env` y demás sin exponer.

### D7 — Configuración y perfiles
- `application.yml`: `spring.datasource.url=${DB_URL}`, `username=${DB_USER}`, `password=${DB_PASSWORD}`, `spring.jpa.hibernate.ddl-auto=validate`, `open-in-view=false`, Flyway habilitado.
- Perfil `test` (`application-test.yml`): `url=${TEST_DB_URL:jdbc:postgresql://localhost:5432/turnos_test}`, mismo usuario por variables. Flyway hace `clean` deshabilitado en todos los perfiles salvo `test` (`spring.flyway.clean-disabled=false` solo ahí) para que cada corrida de tests arranque de cero.
- Variables faltantes en ejecución normal hacen fallar el arranque (sin valores por defecto para credenciales).
- `spring.config.import: optional:file:.env[.properties], optional:file:../.env[.properties]`: Spring no lee `.env` por sí solo; así cada integrante guarda sus credenciales en un `.env` local (ignorado por git) y las variables de entorno reales siguen teniendo prioridad. Agregado durante apply a pedido del usuario.
- La limpieza de `turnos_test` antes de migrar la hace una `FlywayMigrationStrategy` en `src/test` con `@Profile("test")`.

### D8 — Migraciones
`db/migration/V1__extensiones.sql`: `CREATE EXTENSION IF NOT EXISTS btree_gist;`. La numeración por change queda fijada en CHANGES.md (C-03 V2, C-05 V3, C-06 V4, C-07 V5, C-13 V6).

### D9 — Tests
- `HealthIT` (`@SpringBootTest(webEnvironment=RANDOM_PORT)`, perfil `test`): health 200 `UP` sin credenciales, cuerpo sin `components` ni detalles; `/actuator/env` 404; la migración V1 quedó aplicada (consulta a `pg_extension`).
- `GlobalExceptionHandlerTest` (`@WebMvcTest` con un controlador de prueba en `src/test`): 404 con `codigo`, `NegocioException` → estado y `codigo`, validación → 422 con `errores`, JSON mal formado → 400, excepción genérica → 500 sin traza.
- El escenario "base de datos caída" se prueba con un `@WebMvcTest`/`@SpringBootTest` que reemplaza el `HealthIndicator` de la base por uno que devuelve `DOWN`, en vez de apagar PostgreSQL.

## Risks / Trade-offs

- [Sin Docker, los tests dependen de PostgreSQL local con `turnos_test`] → README con pasos exactos; el error de conexión se documenta como causa probable.
- [`clean` de Flyway en el perfil test borra la base] → solo habilitado en `application-test.yml`, que apunta a `turnos_test`; nunca a `turnos`.
- [El primer `./mvnw` necesita internet] → documentado en el README.
- [Seguridad abierta en `/api/**` hasta C-04] → no hay endpoints de negocio todavía; C-04 está en la tanda 3.
- [Integrantes con otra versión de JDK] → `maven-enforcer-plugin` exige Java 21 y falla con un mensaje claro.

## Migration Plan

No aplica (proyecto nuevo). Rollback: revertir el PR.
