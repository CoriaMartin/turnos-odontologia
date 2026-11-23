# Tasks

## 1. Proyecto Maven

- [x] 1.1 Crear `backend/pom.xml` con `spring-boot-starter-parent` 3.3.x, Java 21, starters (web, data-jpa, validation, security, mail, actuator), Flyway (`flyway-core` + `flyway-database-postgresql`), driver PostgreSQL, starters de test y `maven-enforcer-plugin` que exige Java 21; verificar que `./mvnw -v` en `backend/` muestra Maven 3.9 y Java 21
- [x] 1.2 Agregar Maven Wrapper only-script (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`); verificar que `./mvnw -q validate` termina sin errores
- [x] 1.3 Crear `TurnosOdontoApplication` y los paquetes `agenda`, `pacientes`, `prestaciones`, `auth`, `notificaciones`, `configuracion` con `package-info.java` que describe su responsabilidad, y `shared/{error,time,security}`; verificar que `./mvnw -q compile` compila

## 2. Configuración y base de datos

- [x] 2.1 Escribir `application.yml` (datasource por `DB_URL`/`DB_USER`/`DB_PASSWORD`, `ddl-auto=validate`, `open-in-view=false`, `hibernate.jdbc.time_zone=UTC`, Flyway, Actuator solo `health` sin detalles) y `application-test.yml` (`TEST_DB_URL` con default a `turnos_test`, `clean-disabled=false`); verificar que el contexto arranca contra `turnos_test`
- [x] 2.2 Crear `db/migration/V1__extensiones.sql` con `btree_gist`; verificar con un test que la extensión existe en `pg_extension` tras arrancar
- [x] 2.3 Crear `RelojConfig` con el bean `Clock` en `America/Argentina/Buenos_Aires`; verificar con un test que el bean inyectado usa esa zona

## 3. Seguridad temporal y estado del servicio

- [x] 3.1 Crear `SecurityConfig` (stateless, CSRF off, sin form login ni basic, `/actuator/health` y `/api/**` permitidos, comentario de punto de cambio para C-04); verificar que no se genera contraseña por defecto en el log de arranque
- [x] 3.2 Escribir `HealthIT`: health 200 `UP` sin credenciales, cuerpo sin `components`, URL ni detalles; `/actuator/env` 404; indicador de base reemplazado por `DOWN` → 503 `DOWN`; verificar que los escenarios de la spec `service-health` pasan

## 4. Formato de errores

- [x] 4.1 Crear `NegocioException` (abstracta, `codigo` + `HttpStatus`) y `GlobalExceptionHandler` que extiende `ResponseEntityExceptionHandler` y agrega `codigo` (404 `RECURSO_NO_ENCONTRADO`, 400 `SOLICITUD_INVALIDA`, 422 `VALIDACION_FALLIDA` con `errores`, 500 `ERROR_INTERNO` sin traza); verificar que compila
- [x] 4.2 Escribir `GlobalExceptionHandlerTest` con un controlador de prueba en `src/test`: un test por escenario de la spec `api-errors` (ruta inexistente, error de negocio, campo faltante, JSON mal formado, excepción no controlada); verificar que todos pasan

## 5. Documentación y entorno

- [x] 5.1 Crear `.env.example` (placeholders de `DB_*`, `TEST_DB_URL`, `JWT_*`, `ADMIN_*`, `MAIL_*` con `MAIL_ENABLED=false`, `FRONTEND_ORIGIN`) y ampliar `.gitignore` (`.mvn/wrapper/*.jar`); verificar con `git status` que `.env` no se versiona
- [x] 5.2 Escribir el `README.md` raíz: requisitos (JDK 21, PostgreSQL ≥ 15), creación de `turnos` y `turnos_test`, variables de entorno, cómo correr el backend y los tests; verificar siguiendo el README en limpio que `./mvnw verify` corre

## 6. Verificación integral

- [x] 6.1 Correr `./mvnw verify` completo contra `turnos_test` y confirmar que todos los tests pasan y que cada escenario de las specs tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive backend-scaffolding`) y sincronizar specs.
- Marcar `[x]` en C-01 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-01-backend-scaffolding` → `main`.
