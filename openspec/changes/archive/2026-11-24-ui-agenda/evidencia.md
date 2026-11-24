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

Corrida por Agus el 2026-11-24 contra el backend real (`./mvnw spring-boot:run` en `backend/` con su `.env` + `npm run dev` en `frontend/`), con el usuario inicial. Resultado informado: **todo OK**.

- Datos: 5 turnos `PROGRAMADO` creados con un script local de PowerShell (fuera del repo) que pide las credenciales por consola: 3 para hoy, después de la hora actual, y 2 para mañana, en secuencia y sin solaparse, con distintas prestaciones.
- Checklist revisado: turnos en su horario en la vista diaria y en la semanal; línea de hora actual en el día de hoy; "Día anterior"/"Día siguiente", "Hoy" y el campo "Fecha" piden el período correcto (pestaña Red); con el backend apagado aparece "No pudimos cargar la agenda" y "Reintentar" vuelve a cargar al levantarlo.
- No cubierto contra el backend real: turnos atendidos, ausentes o cancelados, porque cancelar y registrar asistencia (C-09, C-11) todavía no están en `main`. Esos estados están cubiertos por los tests y por la verificación visual con datos simulados.

## Verificación visual (tarea 4.3)

Ver `design.md` → `### UI Mockups` → `Visual verify` y las capturas de `mockups/verify/`.
