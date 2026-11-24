# Proposal — consultar-agenda (C-08)

## Why

El odontólogo ya puede crear y reprogramar turnos (C-07, C-10), pero no tiene forma de ver su agenda: la API solo devuelve un turno por id. La vista diaria y semanal de US-031 (C-16, `ui-agenda`) necesita un endpoint que liste los turnos de un período, y es el siguiente paso del camino crítico (`C-07 → C-08 → C-16`).

## What Changes

- Nuevo endpoint `GET /api/turnos?desde=&hasta=` que devuelve los turnos que ocupan alguna parte del período `[desde, hasta)`, ordenados por inicio.
- `desde` y `hasta` son obligatorios, en ISO-8601 con zona horaria (RN-GL-01); `hasta` debe ser posterior a `desde` y el período no puede superar 31 días. Si no se cumple, 422 `VALIDACION_FALLIDA` con el campo en `errores`.
- Cada turno trae el mismo resumen que `GET /api/turnos/{id}`: horario, estado, duración, resumen de paciente (id, nombre, apellido) y de prestación (id, nombre), sin DNI ni datos de contacto.
- Parámetro opcional `incluirCancelados` (por defecto `true`): con `false` se omiten los turnos `CANCELADO` y `CANCELADO_TARDIO`. Por defecto se incluyen porque US-031 pide mostrarlos distinguidos.
- Requiere autenticación, como el resto de `/api/turnos`.
- Sin UI: no lleva maqueta (`Decision: no (no UI)`). La vista la construye C-16.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `turnos`: se agrega el requisito de consultar la agenda por período (listado con rango obligatorio, máximo 31 días, orden por inicio, filtro de cancelados).

## Impact

- **Backend**: `TurnoController` (nuevo `GET` sin id), `TurnoService` (consulta de solo lectura), `TurnoRepository` (consulta por período con `join fetch` de paciente y prestación). Reutiliza `TurnoResponse` y el `GlobalExceptionHandler` existentes.
- **Base de datos**: sin migraciones; usa el índice existente sobre `turno(inicio)`.
- **API**: endpoint nuevo, ya previsto en `knowledge-base/02_descripcion_general.md` §API REST. No cambia los existentes.
- **Tests**: nuevo `TurnoAgendaIT` contra `turnos_test`, uno por escenario del spec.
- **Consumidores**: C-16 `ui-agenda` (lo construye la misma responsable).
- **Governance**: BAJO (consulta de solo lectura).
