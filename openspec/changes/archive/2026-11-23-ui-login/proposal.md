# Proposal — C-14 `ui-login`

## Why

El backend ya exige un token en toda la API (C-04, spec `autenticacion`), pero la web app no tiene cómo iniciar sesión: cualquier pantalla de negocio (C-15, C-16) fallaría con 401. C-14 conecta la web app con el login para que solo el odontólogo vea sus datos y para que C-15 y C-16 puedan arrancar.

## What Changes

- Nueva página pública `/login` con email y contraseña, basada en `design-system/components.html` §Inicio de sesión.
- El token que devuelve `POST /api/auth/login` se guarda **solo en memoria** (nunca en `localStorage`, `sessionStorage` ni cookies) y se conecta al cliente HTTP con `configurarProveedorToken` (punto de extensión de C-02).
- Rutas protegidas: sin sesión, toda ruta de la app lleva a `/login` y, al ingresar, vuelve a la ruta pedida (o a `/` por defecto, que en C-16 será la agenda).
- Ante un 401 de la API con sesión iniciada (token vencido o inválido) se cierra la sesión, se limpia la caché de datos y se vuelve a `/login` con un aviso de sesión vencida.
- Botón "Cerrar sesión" en la barra superior.
- Mensajes con el tono de `design-system/brand.md`, sin códigos técnicos: credenciales inválidas (genérico, sin revelar qué dato falló), bloqueo por intentos (429, 15 minutos), campos incompletos, sin conexión y sesión vencida. Los textos de `CREDENCIALES_INVALIDAS` y `LOGIN_BLOQUEADO` se suman a `MENSAJES_POR_CODIGO`.
- Consecuencia aceptada del token en memoria: recargar la página o abrir otra pestaña pide ingresar de nuevo (no hay refresh token en el MVP, KB 08 §Seguridad).
- **BREAKING (comportamiento de la web app)**: `/` y las rutas inexistentes dejan de ser visibles sin sesión.

## Capabilities

### New Capabilities
- `web-sesion`: inicio y cierre de sesión en la web app, guarda del token en memoria, protección de rutas, reacción ante 401 y mensajes de error de login.

### Modified Capabilities
- `web-app-shell`: la barra superior, el inicio y la página de ruta inexistente pasan a mostrarse solo con sesión iniciada; la barra suma "Cerrar sesión". `/login` se muestra sin barra superior.

## Impact

- **Frontend**: `src/features/auth/` (estado de sesión, API de login, página, ruta protegida), `src/app/router.tsx`, `src/app/AppLayout.tsx`, `src/app/queryClient.ts` (reacción global ante 401), `src/shared/api/mensajes.ts`, `src/main.tsx`. Sin cambios en `shared/api/cliente.ts` más allá de usar su punto de extensión.
- **Backend**: ninguno. Consume `POST /api/auth/login` (200 `{token, tipo, expiraEn}`, 401 `CREDENCIALES_INVALIDAS`, 422 `VALIDACION_FALLIDA`, 429 `LOGIN_BLOQUEADO`) y el 401 `NO_AUTENTICADO` de las rutas protegidas.
- **Dependencias nuevas**: ninguna.
- **Governance**: ALTO (seguridad de la sesión). Maqueta requerida (`system-and-mockups`); el apply espera la aprobación del líder.
- **Desbloquea**: C-15 `ui-prestaciones-pacientes`, C-16 `ui-agenda`, C-18.
