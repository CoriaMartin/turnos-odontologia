# Tasks

## 1. Configuración y token

- [x] 1.1 Agregar jjwt (api, impl, jackson) al `pom.xml` y las propiedades `app.seguridad` / `app.admin` en `application.yml` (y valores ficticios en `application-test.yml`); verificar que `./mvnw -q compile` compila
- [x] 1.2 Crear `SeguridadProperties` y `AdminProperties`; verificar con `SeguridadPropertiesTest` que un `JWT_SECRET` de menos de 32 bytes falla con un mensaje que nombra la variable
- [x] 1.3 Crear `TokenJwtService` (emitir y validar con el `Clock`); verificar con `TokenJwtServiceTest` emisión válida, token vencido y firma con otra clave

## 2. Login y bloqueo

- [x] 2.1 Crear `BloqueoLogin` en memoria; verificar con `BloqueoLoginTest` bloqueo al 5.º fallo, desbloqueo a los 15 minutos y reinicio tras éxito
- [x] 2.2 Crear `AuthService`, excepciones (`CredencialesInvalidasException`, `LoginBloqueadoException`) y `AuthController` (`POST /api/auth/login` con DTOs validados); verificar que compila

## 3. Seguridad HTTP

- [x] 3.1 Reemplazar `SecurityConfig` (reglas por ruta, filtro JWT, punto de entrada y acceso denegado en Problem Details, CORS) y crear `JwtFiltroAutenticacion`; adaptar `GlobalExceptionHandlerTest` a `addFilters = false`; verificar que los tests de C-01 siguen en verde
- [x] 3.2 Escribir `AuthIT` con un test por escenario de la spec `autenticacion` (login, credenciales inválidas, validación, rutas protegidas, bloqueo, logs sin contraseña, CORS); verificar que todos pasan

## 4. Usuario inicial

- [x] 4.1 Crear `UsuarioInicial` (`ApplicationRunner`); verificar con `UsuarioInicialIT` los escenarios de la spec `usuario-inicial` (creación con hash y profesional, idempotencia, falta `ADMIN_PASSWORD`)

## 5. Documentación y verificación

- [x] 5.1 Actualizar el README con las variables de seguridad, cómo generar un `JWT_SECRET` y el usuario inicial; verificar que los pasos coinciden con `.env.example`
- [x] 5.2 Correr `./mvnw verify` completo y confirmar que pasan los tests de C-01, C-03 y C-04 y que cada escenario de las specs tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive auth-jwt`) y sincronizar specs.
- Marcar `[x]` en C-04 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-04-auth-jwt` → `main`.
- Cada integrante agrega `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` a su `.env`.
