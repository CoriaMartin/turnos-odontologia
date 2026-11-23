# Proposal

## Why

El backend ya tiene autenticación y pacientes (C-01, C-03, C-04, C-06), pero todavía no existe frontend. Ninguna pantalla (C-14 login, C-15, C-16 agenda, C-17, C-18) puede arrancar sin un proyecto que compile, cargue el sistema de diseño aprobado y hable con la API con un formato de errores común. C-02 es la raíz de toda la rama de frontend de [CHANGES.md](../../../CHANGES.md) y lo hace Agus en la tanda 1.

## What Changes

- Nuevo proyecto `frontend/` con Vite 5, React 18, TypeScript en modo estricto, React Router, TanStack Query, Vitest y Testing Library.
- Estructura de carpetas de [KB 08](../../../knowledge-base/08_arquitectura_propuesta.md): `features/{agenda,pacientes,prestaciones,auth,configuracion}`, `shared/` y `pages/`.
- El sistema de diseño se carga una sola vez en `main.tsx`, importando `design-system/tokens.css` desde su ubicación original (sin copiarlo), y una constante de marca equivalente a `design-system/brand.js`.
- Cliente HTTP en `shared/api` que usa `VITE_API_URL`, agrega `Authorization: Bearer <token>` cuando hay token y convierte las respuestas Problem Details del backend en un error tipado con `codigo`.
- Traducción de los códigos de error genéricos a mensajes en español rioplatense. El usuario nunca ve el código técnico.
- Layout base: barra superior con logo y nombre del producto ("Agenda de Odontología"), área de contenido, página de inicio provisoria y página 404.
- Tests de render del layout y de la página 404, y de la traducción de errores del cliente.
- Maqueta HTML del layout base y de la 404 en `mockups/`, que se aprueba antes de `apply`.

Fuera de alcance: login, guardado del token y redirección ante 401 (C-14); navegación entre secciones y pantallas de negocio (C-15 a C-18); README completo (C-20); CI.

## Capabilities

### New Capabilities
- `web-app-shell`: estructura visible común de la web app (barra superior con marca, área de contenido, página de inicio y página 404) que todas las pantallas reutilizan.
- `web-api-client`: cómo el frontend llama a la API: URL base configurable, envío del token y conversión de errores Problem Details en errores tipados con mensajes para el usuario.

### Modified Capabilities
- Ninguna. `api-errors` define el formato que emite el backend y no cambia: este change solo lo consume.

## Impact

- Código nuevo en `frontend/` (incluye `frontend/.env.example` con `VITE_API_URL` y su `.gitignore`).
- `README.md` raíz: sección breve para instalar y levantar el frontend y correr sus tests.
- Dependencias nuevas de npm: React 18, React Router, TanStack Query, Vite 5, TypeScript 5, Vitest, Testing Library, jsdom.
- Entorno: Node ≥ 20 (el stack fija 20; se verifica también con la versión local de cada integrante).
- Desbloquea C-14 (ui-login) y, a través de él, todo el frontend. Crea los archivos compartidos (router, cliente HTTP, layout) que los changes siguientes solo extienden.
