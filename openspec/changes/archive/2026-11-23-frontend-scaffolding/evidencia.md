# Evidencia · C-02 frontend-scaffolding

Fecha: 2026-11-23 · Máquina: Windows 11, Node 24.20.0, npm 11.19.0 · Rama `agus/C-02-frontend-scaffolding`

## `npm run verify` (en `frontend/`)

```
> tsc --noEmit                      (sin errores)
> vitest run
 ✓ src/shared/api/mensajes.test.ts  (9 tests)
 ✓ src/shared/api/cliente.test.ts   (14 tests)
 ✓ src/shared/brand.test.ts         (3 tests)
 ✓ src/app/indexHtml.test.ts        (1 test)
 ✓ src/app/estilos.test.ts          (1 test)
 ✓ src/app/AppLayout.test.tsx       (3 tests)
 ✓ src/pages/paginas.test.tsx       (3 tests)
 Test Files  7 passed (7)
      Tests  34 passed (34)
> tsc --noEmit && vite build
 dist/index.html  dist/assets/index-*.css  dist/assets/index-*.js
 ✓ built
```

Código de salida 0, sin advertencias en la salida de los tests.

## Escenario → test

| Spec | Escenario | Test |
|---|---|---|
| web-app-shell | Página de inicio con la marca | `src/app/AppLayout.test.tsx` |
| web-app-shell | Barra presente en una ruta inexistente | `src/app/AppLayout.test.tsx` |
| web-app-shell | Contenido de la ruta en la región principal | `src/app/AppLayout.test.tsx` |
| web-app-shell | Inicio sin agenda | `src/pages/paginas.test.tsx` |
| web-app-shell | Ruta inexistente | `src/pages/paginas.test.tsx` |
| web-app-shell | Volver al inicio desde la página inexistente | `src/pages/paginas.test.tsx` |
| web-app-shell | Idioma del documento | `src/app/indexHtml.test.ts` |
| web-app-shell | Variables del sistema de diseño disponibles | `src/app/estilos.test.ts` |
| web-api-client | Ruta con URL base configurada | `src/shared/api/cliente.test.ts` |
| web-api-client | URL base con barra final | `src/shared/api/cliente.test.ts` |
| web-api-client | Respuesta exitosa con cuerpo | `src/shared/api/cliente.test.ts` |
| web-api-client | Respuesta exitosa sin cuerpo | `src/shared/api/cliente.test.ts` |
| web-api-client | Solicitud con sesión | `src/shared/api/cliente.test.ts` |
| web-api-client | Solicitud sin sesión | `src/shared/api/cliente.test.ts` |
| web-api-client | Error de negocio | `src/shared/api/cliente.test.ts` |
| web-api-client | Error de validación con campos | `src/shared/api/cliente.test.ts` |
| web-api-client | Error con cuerpo no reconocido | `src/shared/api/cliente.test.ts` |
| web-api-client | Sin conexión (cliente) | `src/shared/api/cliente.test.ts` |
| web-api-client | Sin conexión (mensaje) | `src/shared/api/mensajes.test.ts` |
| web-api-client | Código sin mensaje propio | `src/shared/api/mensajes.test.ts` |

Además: sincronización de `BRAND_NAME` con `design-system/brand.js`, comprobado que falla al cambiar un solo lado (`src/shared/brand.test.ts`), URL por defecto sin `VITE_API_URL`, Problem Details ilegible, cancelación por `AbortSignal`, y que ningún mensaje contiene un código técnico.

## README (tarea 5.1) y `.env.example` (tarea 1.3)

- `frontend/.env.example` lo creó Agus con el contenido acordado. Los permisos del agente bloquean leer y escribir `.env*`; su existencia se confirmó con `git status` (`?? frontend/.env.example`, no ignorado: se versiona).
- Pasos de la sección "5. Frontend" ejecutados por el agente: `npm install`, `npm run dev` (app en `http://localhost:5173`), `npm test` y `npm run verify`. El paso `Copy-Item .env.example .env` no lo pudo correr el agente por el mismo permiso; sin `.env`, el cliente usa `http://localhost:8080/api` por defecto (cubierto por test).

## Verificación visual

Ver `design.md` → `## UI Mockups` → `Visual verify` y las capturas en `mockups/verify/`.

## Tokens (regla de AGENTS.md)

Búsqueda de `#hex`, `rgb(` y `px` en `frontend/src`: solo las variables locales documentadas en D7 (`--contenido-max`, `--logo-barra`, `--borde-fino`), el punto de quiebre de 900px y el valor esperado en `estilos.test.ts`.
