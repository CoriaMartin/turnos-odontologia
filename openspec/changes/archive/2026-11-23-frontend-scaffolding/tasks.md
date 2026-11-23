# Tasks

> Gate previo: no empezar el grupo 1 hasta que la maqueta de `mockups/` tenga `Approval: approved` del líder registrada en `design.md` y `mockups/README.md`. La maqueta y sus capturas son criterio de aceptación de los grupos 3 y 6.

## 1. Proyecto Vite

- [x] 1.1 Crear `frontend/package.json` (scripts `dev`, `build`, `preview`, `test`, `typecheck`, `verify`; `engines.node >=20`) con React 18, React Router 6, TanStack Query 5, Vite 5, TypeScript 5, Vitest 2, Testing Library (react, jest-dom, user-event) y jsdom; verificar que `npm install` termina sin errores y genera `package-lock.json`
- [x] 1.2 Crear `tsconfig.json` estricto, `vite.config.ts` (plugin React, alias `@design-system` → `../design-system`, `server.fs.allow`, puerto 5173 `strictPort`, configuración de Vitest con `jsdom` y `src/test/setup.ts`), `index.html` con `lang="es-AR"` y `src/vite-env.d.ts` con el tipo de `VITE_API_URL`; verificar que `npm run typecheck` pasa
- [x] 1.3 Crear las carpetas `src/features/{agenda,pacientes,prestaciones,auth,configuracion}` (con un `README.md` de una línea sobre su responsabilidad), `src/shared/`, `src/pages/`, `src/app/` y `src/test/`, más `frontend/.gitignore` y `frontend/.env.example` con `VITE_API_URL`; verificar que `git status` no muestra `node_modules` ni `.env`

## 2. Sistema de diseño y marca

- [x] 2.1 Importar `@design-system/tokens.css` y `src/app/global.css` (base de `components.html` solo con `var(--…)`) en `main.tsx`; verificar con un test que `--color-brand-600` está definida en el documento (escenario "Variables del sistema de diseño disponibles")
- [x] 2.2 Crear `src/shared/brand.ts` con `BRAND_NAME = "Agenda de Odontología"`, y un test que lee `design-system/brand.js` y compara el nombre; verificar que el test pasa y falla si se cambia un solo lado
- [x] 2.3 Agregar un test que verifica `lang="es-AR"` en `index.html` (escenario "Idioma del documento"); verificar que pasa

## 3. Layout, inicio y 404

- [x] 3.1 Crear `src/app/router.tsx` (ruta raíz con `AppLayout`, índice `InicioPage`, comodín `NoEncontradaPage`), `src/app/queryClient.ts` (sin reintento en 4xx, un reintento en 5xx o `SIN_CONEXION`), `AppProviders` y `main.tsx`; verificar que `npm run build` genera `dist/`
- [x] 3.2 Crear el helper `src/test/renderConRutas.tsx` (router en memoria con las rutas reales y un `QueryClient` por test); verificar que lo usa al menos un test
- [x] 3.3 Implementar `AppLayout` con barra superior (logo con texto alternativo y nombre, sin rótulo "Marca provisoria") y `<main>`, con CSS Module que use solo `var(--…)` y siga la maqueta aprobada; verificar con tests los escenarios "Página de inicio con la marca", "Barra presente en una ruta inexistente" y "Contenido de la ruta en la región principal"
- [x] 3.4 Implementar `InicioPage` y `NoEncontradaPage` con los textos de la maqueta y su `document.title`; verificar con tests los escenarios "Inicio sin agenda", "Ruta inexistente" y "Volver al inicio desde la página inexistente"

## 4. Cliente HTTP

- [x] 4.1 Implementar `src/shared/api/ApiError.ts` y `cliente.ts` (`apiFetch`, unión de URL base y ruta, JSON, 204, `configurarProveedorToken`); verificar con tests los escenarios "Ruta con URL base configurada", "URL base con barra final", "Respuesta exitosa con cuerpo", "Respuesta exitosa sin cuerpo", "Solicitud con sesión" y "Solicitud sin sesión"
- [x] 4.2 Implementar la conversión de errores (Problem Details, formato desconocido, falla de red; la cancelación por `AbortSignal` se propaga sin convertir); verificar con tests los escenarios "Error de negocio", "Error de validación con campos", "Error con cuerpo no reconocido" y "Sin conexión" (cliente), más un test de cancelación
- [x] 4.3 Implementar `src/shared/api/mensajes.ts` (`mensajeDeError` con los códigos genéricos y mensaje por defecto, en rioplatense con "vos"); verificar con tests los escenarios "Sin conexión" (mensaje) y "Código sin mensaje propio", y que ningún mensaje contiene su código

## 5. Documentación

- [x] 5.1 Agregar al `README.md` raíz la sección del frontend (requisito Node ≥ 20, `cd frontend`, `npm install`, copiar `.env.example` a `.env`, `npm run dev`, `npm test`, `npm run verify`); verificar siguiendo los pasos tal como están escritos

## 6. Verificación integral

- [x] 6.1 Correr `npm run verify` en `frontend/`; verificar que tipos, tests y build quedan en verde y registrar la salida resumida como evidencia
- [x] 6.2 Levantar `npm run dev`, capturar `/` y `/ruta-que-no-existe` a 390x844 y 1440x900 en `mockups/verify/`, revisar consola y red, y comparar con la maqueta aprobada; verificar que no hay diferencias bloqueantes ni mayores y registrar `Visual verify` en `design.md`
- [x] 6.3 Buscar en `frontend/src` colores hexadecimales, `rgb(` y medidas en `px`; verificar que solo aparecen en las variables locales documentadas según D7 (regla de tokens de AGENTS.md)

## Workflow follow-up

- Abrir el PR de `agus/C-02-frontend-scaffolding` hacia `main` para que lo revise el líder.
- Archivar el change y marcar `[x]` en C-02 de `CHANGES.md` en el mismo PR.
