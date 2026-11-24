# Evidencia · C-17 ui-gestion-turnos

## Tests (tarea 4.1)

`npm run verify` en `frontend/` (2026-11-24): typecheck, **31 archivos / 287 tests en verde** (80 nuevos; los últimos dos, de las correcciones de la verificación visual) y build.

| Spec | Escenarios | Tests |
|---|---|---|
| `web-gestion-turnos` | 36 | `gestionTurnos.test.tsx` (app real con `simularBackend`: un test por escenario, de "Desde el botón" a "Token rechazado al crear"), `gestion.test.ts` (acciones por estado, cancelación tardía y límite, hora de fin y medianoche, validación, franjas libres), `turnosApi.test.tsx` (método, ruta y cuerpo de cada operación; invalidación de `['turnos']`), `mensajes.test.ts` (textos sin códigos técnicos), `cliente.test.ts` (`turnoEnConflicto` en `ApiError.propiedades`) |

Reglas del proyecto: `Gestion.module.css` usa solo variables (controlado por `app/estilos.test.ts`); las dos medidas nuevas (`--dialogo-max`, `--motivo-alto`) son variables locales de `.pagina` en `Agenda.module.css`, con el mismo criterio que C-16. Los tests de C-14, C-15 y C-16 siguen en verde sin cambios.

## Contratos (tarea 0.3)

Confirmados contra las specs archivadas de C-09 y C-11 y el código de C-12: ver `design.md` → "Contratos confirmados (2026-11-24)". Sin cambios en la spec.

## Prueba manual contra el backend (tarea 4.2)

Corrida por Agus el 2026-11-24 contra el backend real (`./mvnw spring-boot:run` en `backend/` + `npm run dev` en `frontend/`), con el usuario inicial. Resultado informado: **todo OK**.

Checklist de la tarea 4.2: crear un turno, solapamiento al crear, reprogramar, cancelar anticipada y tardía, marcar atendido y marcar ausente.

La prueba manual se hizo **antes** de las correcciones de la verificación visual (foco tras un rechazo, errores que se borran al corregir, aviso traído a la vista, estilos). Esas correcciones están cubiertas por tests y por las capturas de `mockups/verify/`, no por una nueva prueba manual.

## Verificación visual (tarea 4.3)

Corrida el 2026-11-24 con Playwright contra `npm run dev`, con la API simulada (`page.route`) y el reloj fijo en el martes 01/12 a las 09:00 (y a las 10:05 para "ya empezó"), con los datos ficticios de la maqueta. No se tocó la base local. 36 capturas en `mockups/verify/` (18 estados a 390x844 y 1440x900).

Encontró y se corrigieron cinco diferencias (tres mayores, dos menores); el detalle está en `design.md` → `### UI Mockups` → `Visual verify`. Las diferencias aceptadas a propósito siguen siendo las de `design.md` D10.
