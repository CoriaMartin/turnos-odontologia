# Evidencia · C-16 ui-agenda

## Tests (tarea 4.1)

`npm run verify` en `frontend/` (2026-11-24): typecheck, **18 archivos / 127 tests en verde** y build.

| Spec | Escenarios | Tests |
|---|---|---|
| `web-agenda` | 35 | `AgendaPage.test.tsx` (navegación, URL, vista por defecto, rango pedido), `vistas.test.tsx` (datos del turno, badges, cancelados, semana), `estados.test.tsx` (hora actual, cargando, vacío, error, reintentar), `fechas.test.ts`, `lineaDeTiempo.test.ts`, `api.test.ts`, `sesionEnLaApp.test.tsx` (401 al cargar la agenda) |
| `web-app-shell` (delta REMOVED) | — | `paginas.test.tsx`: `/` muestra la agenda y ya no el aviso provisorio; los tests de C-14 que buscaban "Inicio" ahora buscan "Agenda" |

Ajustes a tests existentes:
- `sesionEnLaApp.test.tsx` · "Cerrar sesión": devolvía siempre el mismo `Response`; desde C-16 `/` pide la agenda y consumía el cuerpo antes del `apiFetch` del test. Ahora crea una respuesta por solicitud.
- `AppLayout.test.tsx`, `RutaProtegida.test.tsx`, `paginas.test.tsx`: simulan la API de la agenda para no salir a la red.

Reglas del proyecto: sin hexadecimales ni `rgb()` en `features/agenda`; las medidas en `px` están solo en variables locales documentadas de `.pagina` (mismo criterio que C-02 y C-14).

## Prueba manual contra el backend (tarea 4.2)

Ver `tasks.md` 4.2.

## Verificación visual (tarea 4.3)

Ver `design.md` → `### UI Mockups` → `Visual verify` y las capturas de `mockups/verify/`.
