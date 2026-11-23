# Design

## Context

Todavía no existe `frontend/` (ver proposal.md, Why). El stack, la estructura de carpetas y `VITE_API_URL` ya están decididos en [KB 02](../../../knowledge-base/02_descripcion_general.md) y [KB 08](../../../knowledge-base/08_arquitectura_propuesta.md). El backend ya responde errores Problem Details con `codigo` (spec `api-errors`), exige JWT en `/api/**` salvo login (C-04) y acepta CORS desde `FRONTEND_ORIGIN` (por defecto `http://localhost:5173`). El sistema de diseño (`design-system/`) se aprobó en su revisión 1 y pasó a la revisión 2 durante este change. El nombre "Agenda de Odontología" y el logo definitivo quedaron aprobados por el líder (2026-11-23) en `design-system/`. Reglas de [AGENTS.md](../../../AGENTS.md) que aplican: solo variables `var(--…)` de `tokens.css` y textos en rioplatense sin códigos técnicos. Requisitos de comportamiento: specs `web-app-shell` y `web-api-client`.

## Goals / Non-Goals

**Goals:**
- Que cualquier integrante corra `npm install` y `npm run verify` (tipos, tests y build) en verde dentro de `frontend/`.
- Dejar fijados los puntos de extensión que C-14 a C-18 reutilizan: router con layout, cliente HTTP, mensajes de error, proveedores (TanStack Query) y helper de tests.

**Non-Goals:**
- Guardar el token, pantalla de login y redirección ante 401 (C-14). El cliente solo expone el punto donde C-14 conecta el token.
- Menú de navegación entre secciones: no hay secciones todavía. Cada change que agrega una pantalla agrega su enlace.
- ESLint, Prettier o CI.

## Decisions

### D1 — Proyecto escrito a mano con npm
`package.json`, `vite.config.ts`, `tsconfig.json` e `index.html` escritos explícitamente, con npm (viene con Node) y `package-lock.json` versionado. Versiones: React 18, React Router 6, TanStack Query 5, Vite 5, TypeScript 5, Vitest 2 (compatible con Vite 5), Testing Library (React 16, jest-dom, user-event) y jsdom. `"engines": { "node": ">=20" }`.
- *Alternativa*: `npm create vite`. Se descarta porque la plantilla trae archivos de ejemplo y ESLint que habría que borrar, y no fija Vite 5.
- *Alternativa*: React Router 7. Se descarta porque el stack declara React 18 y la API de datos de la 6 alcanza. Migrar luego es acotado.
- Se verifica con la versión local de cada integrante (Node 24 en la máquina de Agus); el mínimo declarado sigue siendo 20.

### D2 — El sistema de diseño se referencia, no se copia
Alias de Vite `@design-system` → `../design-system` y `server.fs.allow: ['..']`. `main.tsx` importa `@design-system/tokens.css` una sola vez y el logo se importa como recurso desde `@design-system/assets/logo.svg`. Así hay una única fuente de verdad: si cambia `tokens.css` (nueva revisión), el frontend lo toma sin copiar nada.
- *Alternativa*: copiar `tokens.css` a `frontend/src`. Se descarta porque dos copias se desincronizan, y la regla de revisiones del sistema de diseño asume un solo archivo.

### D3 — Marca como constante TypeScript sincronizada con `brand.js`
`shared/brand.ts` exporta `BRAND_NAME = "Agenda de Odontología"`. La barra no muestra el rótulo "Marca provisoria". `brand.js` no es un módulo (modifica el DOM al cargarse), así que no se puede importar. Un test lee `design-system/brand.js` como texto y verifica que el nombre coincida: si alguien renombra en un solo lado, el test falla.
- **Dependencia resuelta (2026-11-23)**: el líder aprobó actualizar `BRAND_NAME` en `design-system/brand.js` (y `brand.md`, `README.md`, sin rótulo en `components.html`). Junto con el logo (abajo), el líder lo registró como **revisión 2** del sistema de diseño (2026-11-23), sin volver a revisar las maquetas. Las maquetas vuelven a cargar `brand.js`.
- **Logo (autorizado por el líder, 2026-11-23)**: `design-system/assets/logo.svg` deja de ser placeholder. Se quitaron el texto "TBD" y el borde punteado; la muela queda igual (mismo trazo y colores) y centrada con `transform="translate(2 -2)"`, porque su centro estaba en (18, 22) sobre un lienzo de 40×40. En la app, el texto alternativo del logo es "Agenda de Odontología", tomado de `BRAND_NAME`. En `components.html`, el logo lleva `alt=""` porque el nombre está escrito al lado (decisión de Agus, 2026-11-23), y ya no se dice que el logo es provisorio.
- *Alternativa*: convertir `brand.js` en módulo. Se descarta porque cambia un archivo del sistema aprobado que usan las maquetas HTML.

### D4 — Router y layout
`createBrowserRouter` en `src/app/router.tsx`: una ruta raíz con `AppLayout` (barra superior + `<main>` con `<Outlet/>`), hija índice `InicioPage` y comodín `*` → `NoEncontradaPage`, ambas en `src/pages/`. La 404 vive dentro del layout para conservar la barra. Los changes siguientes agregan rutas hijas, y C-14 agrega `/login` y la protección.
- `document.title`: "Inicio · {BRAND_NAME}" y "Página no encontrada · {BRAND_NAME}".

### D5 — Cliente HTTP sobre `fetch`
`src/shared/api/`:
- `cliente.ts`: `apiFetch<T>(ruta, opciones)` con `method`, `body` (se serializa a JSON) y `signal`. Une la URL base y la ruta normalizando barras. Agrega `Accept: application/json`, `Content-Type` solo si hay cuerpo y `Authorization` si el proveedor de token devuelve un valor. Si la respuesta es 204 o no tiene cuerpo, devuelve `undefined`.
- `configurarProveedorToken(fn: () => string | null)`: el proveedor por defecto devuelve `null`. C-14 registra el suyo (token en memoria) sin tocar el cliente.
- `ApiError extends Error` con `status`, `codigo`, `titulo`, `detalle` y `errores: { campo, mensaje }[]`. Se reconoce Problem Details por `Content-Type: application/problem+json`. Si el JSON no se puede leer o el formato es otro → `ERROR_DESCONOCIDO`. Si `fetch` rechaza (red o CORS) → estado 0 y `SIN_CONEXION`. Una cancelación por `AbortSignal` se propaga tal cual y no se convierte en `ApiError`.
- `mensajes.ts`: `mensajeDeError(error)` con un mapa código → texto rioplatense para los códigos genéricos (`SIN_CONEXION`, `ERROR_INTERNO`, `ERROR_DESCONOCIDO`, `VALIDACION_FALLIDA`, `RECURSO_NO_ENCONTRADO`, `SOLICITUD_INVALIDA`) y un mensaje genérico por defecto. Cada change agrega los de su dominio (por ejemplo, `TURNO_SOLAPADO` en C-17).
- *Alternativa*: axios. Se descarta porque `fetch` alcanza y evita una dependencia.

### D6 — TanStack Query
`QueryClient` en `src/app/queryClient.ts`: no reintenta ante `ApiError` 4xx, reintenta una vez ante 5xx o `SIN_CONEXION`. `AppProviders` envuelve `QueryClientProvider` + `RouterProvider` en `main.tsx`.

### D7 — Estilos
CSS Modules por componente (soportados por Vite sin configuración) y un `src/app/global.css` con la base de `components.html` (box-sizing, `body` con `--font-sans`, `--color-canvas`, etc.). Solo se usan `var(--…)`. Para valores que el sistema no define (por ejemplo, el ancho máximo del contenido, 1200 px en `components.html`) se usa el valor de `components.html` como variable local del módulo con comentario de origen, y se anota para la próxima revisión del sistema. Quedaron así `--contenido-max` (1200px), `--logo-barra` (32px) y `--borde-fino` (1px). El punto de quiebre de 900px (`.grid-2` de `components.html`) va literal porque las media queries no aceptan `var()`.
- *Alternativa*: CSS-in-JS o Tailwind. Se descarta porque agrega dependencias y duplica los tokens.

### D8 — Tests
Vitest con entorno `jsdom` y `src/test/setup.ts` (jest-dom). El helper `renderConRutas(ruta)` usa `createMemoryRouter` con las mismas rutas de `router.tsx` y un `QueryClient` nuevo por test. `fetch` se reemplaza con `vi.stubGlobal` y `VITE_API_URL` con `vi.stubEnv`. Se escribe al menos un test por escenario de las dos specs.

### D9 — Configuración y scripts
- `frontend/.env.example` con `VITE_API_URL=http://localhost:8080/api` y `frontend/.gitignore` con `node_modules`, `dist`, `.env` y `.env.local`.
- Servidor de desarrollo en el puerto 5173 (`strictPort`), que coincide con `FRONTEND_ORIGIN`.
- Scripts: `dev`, `build` (`tsc --noEmit && vite build`; un solo `tsconfig.json` sin referencias de proyecto, así que no hace falta `tsc -b`), `preview`, `test` (`vitest run`), `typecheck` y `verify` (typecheck + test + build).
- Solo en tests (`src/test/setup.ts`): el `Request` global descarta el `signal` porque Node rechaza el `AbortSignal` de jsdom cuando React Router navega (remix-run/react-router#10375). No afecta el código de la app.
- Sección corta en el `README.md` raíz: instalar, configurar `.env`, levantar y correr los tests del frontend.

## Risks / Trade-offs

- [`server.fs.allow` amplía lo que el servidor de desarrollo puede servir] → Se limita al directorio padre del repo y solo en desarrollo. El build copia los recursos dentro de `dist/`.
- [El nombre de marca existe en dos archivos] → Lo detecta el test de sincronización (D3).
- [El cliente no maneja 401 todavía] → Es deliberado: C-14 agrega la redirección. Hasta entonces el 401 llega como `ApiError` con estado 401.
- [`npm audit` (2026-11-23): 8 avisos. Los críticos y el alto son de herramientas de desarrollo (vitest/tinypool, servidor de Vite y esbuild). En el código que llega al navegador hay 2 moderados de React Router 6: redirect abierto con barra invertida en `<Link>`/`useNavigate` y uno de SSR que no se usa] → Todos se arreglan solo subiendo versiones mayores (Vite 6/7, Vitest 4/5, React Router 7), y el stack de AGENTS.md fija Vite 5. Queda para decidir con el líder (posible change propio). Mientras tanto: no navegar a rutas armadas con texto del usuario y no exponer el servidor de desarrollo fuera de `localhost`.
- [Node local distinto del 20 declarado] → `engines` fija el mínimo y la verificación se corre en la versión local. C-20 revalida en una máquina limpia.

## UI Mockups

- Design system revision: 2 (la maqueta se aprobó sobre la 1; la 2 solo cambia nombre y logo, y el líder la aprobó el 2026-11-23 sin volver a revisar las maquetas)
- Decision: yes (2026-11-23)
- Mockups: [mockups/](mockups/) — layout base (barra superior + inicio provisorio) y página de ruta inexistente
- Approval: approved (2026-11-23, by líder; confirmado por Agus). El cambio de logo posterior también lo autorizó el líder (2026-11-23), y las capturas se regeneraron con el logo nuevo.
- Preview: rendered (2026-11-23, Playwright: `mockups/inicio-*.png`, `mockups/no-encontrada-*.png`, 390x844 y 1440x900)
- Visual verify: passed (2026-11-23, Playwright contra `npm run dev`: `mockups/verify/`, 390x844 y 1440x900 de `/` y `/ruta-que-no-existe`). Sin diferencias bloqueantes ni mayores. Diferencia menor corregida: el botón "Volver al inicio" no tenía el borde transparente de 1 px de la maqueta (medía 124 px en vez de 126). Consola y red sin errores (se agregó un favicon vacío para evitar el 404 a `/favicon.ico`). Teclado: el primer Tab muestra "Saltar al contenido" y Enter lleva el foco a `#contenido`. Recapturado el 2026-11-23 tras el cambio de logo autorizado por el líder (con la caché del navegador desactivada): maqueta, `design-system/previews/` y `mockups/verify/` muestran el logo sin "TBD" y la app sigue coincidiendo con la maqueta; consola de la app sin errores.
