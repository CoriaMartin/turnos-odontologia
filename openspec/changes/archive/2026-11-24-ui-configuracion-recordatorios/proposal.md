# Proposal — C-18 `ui-configuracion-recordatorios`

## Why

El backend ya tenés la configuración del consultorio (C-12) y los recordatorios (C-13), pero la web app no tenés forma de ver ni modificar esos valores: la pantalla de configuración (C-15, C-16) fallaría si intentás mostrar el estado del recordatorio sin antes poder cargar los valores. C-18 conecta la web app con la configuración para que vos puedas ver y cambiar las horas de cancelación tardía y de recordatorio.

## What Changes

- Nueva pantalla `/configuracion` con el formulario de horas, basada en `design-system/components.html` §Configuración.
- Los valores se guardan mediante `PUT /api/configuracion` y se leen con `GET /api/configuracion`.
- El formulario usa los puntos de extensión de C-02 para mensajes de error y proveedor de token.
- Ante un error de validación se muestra un mensaje con el tono de `design-system/brand.md`, sin códigos técnicos: horas inválidas, formulario incompleto, sin conexión y sesión vencida.
- Los textos de `HORAS_INVALIDAS` y `GUARDAR_EXITOSO` se suman a `MENSAJES_POR_CODIGO`.
- La pantalla no se muestra si no hay sesión iniciada; al cerrar sesión, los valores permanecen en la base pero la pantalla desaparece.

## Capabilities

### New Capabilities

- `web-configuracion`: visualización y modificación de horas de cancelación tardía y de recordatorio, guardado del formulario, reacción ante errores y mensajes de estado.

### Modified Capabilities

- `web-app-shell`: la barra superior y la navegación pasan a mostrarse solo con sesión iniciada; la barra suma la opción "Configuración" cuando hay turno activo.

## Impact

- **Frontend**: `src/features/configuracion/` (estado del formulario, API de configuración, página,), `src/app/router.tsx`, `src/app/AppLayout.tsx`, `src/shared/api/mensajes.ts`, `src/main.tsx`. Sin cambios en `shared/api/cliente.ts` más allá de usar su punto de extensión.
- **Backend**: consume `GET /api/configuracion` y `PUT /api/configuracion` (horas de cancelación tardía y de anticipación del recordatorio, valores por defecto 24 y 24, zona `America/Argentina/Buenos_Aires`). No requiere cambios en el modelo.
- **Dependencias nuevas**: ninguna.
- **Governance**: BAJO (configuración de bajo riesgo). Maqueta requerida (`system-and-mockups`); el apply espera la aprobación del líder.
- **Desbloquea**: C-15 `ui-prestaciones-pacientes`, C-16 `ui-agenda`, C-17.