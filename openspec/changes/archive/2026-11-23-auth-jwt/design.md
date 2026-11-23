# Design

## Context

C-01 dejó una `SecurityConfig` temporal (todo permitido) con el punto de cambio marcado; C-03 dejó `Usuario`, `Profesional`, `UsuarioRepository` y `RecursosConsultorio`. Reglas: RN-AU-01..03 y RN-DS-02/03 en [knowledge-base/05](../../../knowledge-base/05_reglas_de_negocio.md). Motivación en proposal.md; comportamiento en las specs `autenticacion` y `usuario-inicial`. Bloqueo en memoria y valores por defecto del profesional: decisiones del usuario.

## Goals / Non-Goals

**Goals:**
- Todos los rechazos de seguridad con el mismo formato Problem Details + `codigo` que el resto de la API.
- Que la configuración de seguridad incorrecta falle al arrancar, no en el primer login.

**Non-Goals:**
- Refresh token, revocación de tokens, recuperación de contraseña, multiusuario.

## Decisions

### D1 — Librería JWT: jjwt 0.12.x
`jjwt-api` + `jjwt-impl` + `jjwt-jackson` (runtime). HS256 con `Keys.hmacShaKeyFor(JWT_SECRET en UTF-8)`, que además exige ≥ 256 bits.
- *Alternativa*: `spring-boot-starter-oauth2-resource-server` con `NimbusJwtDecoder`. Descarta: sumaría el modelo de resource server y su configuración para un único emisor propio; jjwt es más directo y está nombrado en la KB.
- Claims: `sub` = id de usuario, `email`, `rol`, `iat`, `exp`. `iat`/`exp` calculados con el `Clock` inyectable, y la validación usa el mismo reloj (`Jwts.parser().clock(...)`), así el test de token vencido no depende de esperar.

### D2 — Propiedades tipadas y validadas
- `@ConfigurationProperties("app.seguridad")` (`SeguridadProperties`, `@Validated`): `jwtSecret` (no vacío, ≥ 32 bytes, validado en el constructor con mensaje que nombra `JWT_SECRET`), `jwtExpMinutos` (default 480, > 0), `frontendOrigin`.
- `@ConfigurationProperties("app.admin")` (`AdminProperties`): `email`, `password` (validados recién en la creación inicial y solo si no hay usuarios, porque en un segundo arranque pueden no estar).
- `application.yml` mapea `JWT_SECRET`, `JWT_EXP_MINUTES`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_ORIGIN`. El perfil `test` define valores ficticios propios (no secretos reales).

### D3 — Flujo de login (`AuthService`)
1. Normaliza el email (minúsculas, sin espacios).
2. Si el email está bloqueado → `LoginBloqueadoException` (429 `LOGIN_BLOQUEADO`).
3. Busca el usuario (`findByEmailIgnoreCase`). Si no existe, igual ejecuta `passwordEncoder.matches` contra un hash ficticio para que el tiempo de respuesta no revele si el email existe.
4. Si el usuario no existe, está inactivo o la contraseña no coincide → registra el fallo y lanza `CredencialesInvalidasException` (401 `CREDENCIALES_INVALIDAS`, mensaje "Email o contraseña incorrectos.").
5. Si es correcto → reinicia el contador y emite el token.
- Las excepciones extienden `NegocioException`, así el `GlobalExceptionHandler` de C-01 las traduce sin cambios.

### D4 — Bloqueo en memoria (`BloqueoLogin`)
`ConcurrentHashMap<String, Estado>` por email normalizado, con `Estado(intentos, bloqueadoHasta)` inmutable actualizado con `compute`. Al 5.º fallo fija `bloqueadoHasta = ahora + 15 min` (constantes `MAX_INTENTOS = 5`, `DURACION_BLOQUEO = 15 min`). Usa el `Clock` inyectable. Se reinicia con el servidor (aceptado por el usuario). Se cuentan también los fallos de emails inexistentes, para no distinguirlos.

### D5 — Seguridad HTTP (`SecurityConfig` reemplazada)
- Stateless, CSRF/form login/basic/logout deshabilitados (como C-01).
- `permitAll`: `POST /api/auth/login`, `/actuator/**` (solo `health` está expuesto; los demás siguen dando 404 según `service-health`), `/error`.
- `/api/**` → `hasRole("ODONTOLOGO")`; cualquier otra ruta → `authenticated`.
- `JwtFiltroAutenticacion` (`OncePerRequestFilter`) antes de `UsernamePasswordAuthenticationFilter`: si hay `Authorization: Bearer`, valida y coloca un `UsernamePasswordAuthenticationToken` con principal `UsuarioAutenticado(id, email)` y autoridad `ROLE_ODONTOLOGO`. Un token inválido no corta la cadena: deja el contexto vacío y el punto de entrada responde 401.
- `AuthenticationEntryPoint` y `AccessDeniedHandler` propios que escriben `application/problem+json` con `codigo` `NO_AUTENTICADO` (401) y `ACCESO_DENEGADO` (403), reutilizando `ObjectMapper`.
- Se elimina el `UserDetailsService` vacío de C-01: la autenticación no usa `UserDetailsService`. Para evitar la contraseña generada se excluye `UserDetailsServiceAutoConfiguration`.
- CORS: `CorsConfigurationSource` con solo `FRONTEND_ORIGIN`, métodos GET/POST/PUT/PATCH/DELETE/OPTIONS, encabezados `Authorization` y `Content-Type`.

### D6 — Creación inicial (`UsuarioInicial`)
`ApplicationRunner` transaccional: si `usuarios.count() == 0`, valida `ADMIN_EMAIL`/`ADMIN_PASSWORD` (falla con `IllegalStateException` que nombra la variable), crea `Usuario` con `BCryptPasswordEncoder` y `Profesional(usuario, "Odontólogo", "Titular", null)`. Registra en el log solo "Usuario inicial creado" (sin email ni contraseña). Si ya hay usuarios, no hace nada.

### D7 — Logs
Ningún log incluye contraseña, hash ni token. `AuthService` loguea fallos solo con un contador ("Intento de login fallido") y bloqueos sin el email completo.

### D8 — Tests
- Unitarios sin Spring: `BloqueoLoginTest` (reloj mutable de prueba), `TokenJwtServiceTest` (emitir/validar, vencido, otra clave), `SeguridadPropertiesTest` (secreto corto).
- `@SpringBootTest` + MockMvc contra `turnos_test` (`AuthIT`): login ok con email en otra capitalización, contraseña incorrecta, email inexistente con mismo `detail`, validación 422, sin token 401, token válido 200 (controlador de prueba en `src/test` bajo `/api/prueba/protegida`), token vencido, firma inválida, health público, bloqueo y desbloqueo (reloj mutable `@Primary` en una configuración de test), reinicio del contador, ausencia de la contraseña en respuesta y logs (`OutputCaptureExtension`), CORS permitido/no permitido.
- `UsuarioInicialIT`: base sin usuarios crea usuario + profesional con hash BCrypt y `RecursosConsultorio` funciona; segundo arranque con otra contraseña no modifica; falta `ADMIN_PASSWORD` → excepción que la nombra (invocando el runner con propiedades vacías).
- `GlobalExceptionHandlerTest` (C-01) pasa a `@AutoConfigureMockMvc(addFilters = false)`, porque ahora la seguridad exige token y ese test prueba solo el formato de errores.

## Risks / Trade-offs

- [Bloqueo en memoria se pierde al reiniciar] → aceptado; un atacante no puede reiniciar el servidor.
- [Bloqueo por email permite bloquear al odontólogo a propósito desde afuera] → 15 minutos acotan el daño; con un solo usuario es el compromiso habitual. Se documenta.
- [Token en el frontend] → C-14 lo guarda en memoria (regla de la KB), no en `localStorage`.
- [Integrantes sin `JWT_SECRET` en su `.env`] → el arranque falla con un mensaje claro; README y `.env.example` lo explican.

## Migration Plan

Sin migraciones. Al mergear, cada integrante agrega `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` a su `.env`; el primer arranque crea el usuario en su base `turnos`.
