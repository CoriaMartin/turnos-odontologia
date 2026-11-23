# Proposal

## Why

El sistema guarda datos de salud (Ley 25.326) y hoy la API está abierta (seguridad temporal de C-01). Antes de exponer pacientes, prestaciones y turnos hace falta que solo el odontólogo pueda entrar. Además, C-03 dejó el consultorio sin usuario ni profesional: sin ellos, `RecursosConsultorio` responde `CONSULTORIO_NO_CONFIGURADO`. C-04 es el tercer eslabón del camino crítico y desbloquea C-05, C-06, C-12 y C-14.

## What Changes

- **Creación inicial al arrancar**: si no existe ningún usuario, se crea el usuario `ODONTOLOGO` desde `ADMIN_EMAIL` y `ADMIN_PASSWORD` (contraseña cifrada con BCrypt) y su profesional con nombre "Odontólogo" y apellido "Titular" por defecto. Si faltan las variables, el arranque falla. Si ya hay un usuario, no se toca nada.
- **`POST /api/auth/login`**: devuelve un JWT firmado (HS256, `JWT_SECRET`, vence a los `JWT_EXP_MINUTES` minutos, 480 por defecto). Las credenciales inválidas reciben siempre el mismo error genérico 401.
- **Bloqueo por intentos**: 5 fallidos consecutivos para un email bloquean el login de ese email 15 minutos (429). El contador vive en memoria.
- **Protección de la API**: todo `/api/**` exige un token válido con rol `ODONTOLOGO`, salvo el login. `/actuator/health` sigue público. Los rechazos de autenticación responden Problem Details con `codigo`, igual que el resto de la API.
- **CORS** limitado al origen de `FRONTEND_ORIGIN`.
- **Datos sensibles**: contraseñas, hashes y tokens nunca aparecen en respuestas ni en logs.

Fuera de alcance: refresh token, cambio o recuperación de contraseña, pantalla de login (C-14), perfil del profesional editable.

## Capabilities

### New Capabilities
- `autenticacion`: login con email y contraseña, emisión y validación del token, protección de la API, bloqueo por intentos y errores de autenticación.
- `usuario-inicial`: creación automática del primer usuario y su profesional al arrancar, y validación de la configuración requerida.

### Modified Capabilities
- Ninguna. `service-health` no cambia: health sigue público y los demás endpoints de administración siguen respondiendo 404.

## Impact

- Código nuevo en `backend/.../auth` y reemplazo de la seguridad temporal en `shared/security`.
- Dependencia nueva: `io.jsonwebtoken:jjwt` (api, impl, jackson).
- Variables de entorno: `JWT_SECRET` (obligatoria, ≥ 32 bytes), `JWT_EXP_MINUTES`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_ORIGIN`; ya estaban en `.env.example`. Cada integrante debe completarlas en su `.env`.
- Sin migraciones nuevas.
