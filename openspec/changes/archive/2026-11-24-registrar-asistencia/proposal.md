# Proposal

## Why

Hoy un turno creado (C-07) se puede consultar (C-08), reprogramar (C-10) y cancelar (C-09), pero no hay forma de registrar si el paciente vino: se queda `PROGRAMADO` y la agenda no distingue una asistencia de una inasistencia (US-034, RN-ES-02). C-11 completa las transiciones de estado y habilita la acción de marcar asistencia que consume C-17 (`ui-gestion-turnos`).

## What Changes

- `POST /api/turnos/{id}/asistencia` con cuerpo `{ "estado": "ATENDIDO" | "AUSENTE" }` (obligatorio). **Sin `version`**. Responde 200 con el `TurnoResponse` del turno actualizado.
- Solo se registra asistencia de un turno `PROGRAMADO` con hora actual mayor o igual al inicio (RN-ES-02). El límite es inclusivo: exactamente en el inicio se permite. No hay límite superior: se puede marcar después del `fin`, porque la KB no fija otro plazo.
- El turno pasa a `ATENDIDO` o `AUSENTE`, estados finales: conserva `id`, horario, paciente y prestación. No se registra motivo ni fecha nueva. Sigue ocupando el horario (RN-AG-01).
- Cualquier otro estado o un inicio futuro → 409 `TRANSICION_INVALIDA` sin modificar el turno (RN-ES-04). Turno inexistente → 404 `TURNO_NO_ENCONTRADO`. Sin token → 401 `NO_AUTENTICADO`.
- `estado` ausente → 422 `VALIDACION_FALLIDA` con el campo en `errores`; valor no admitido → 400 `SOLICITUD_INVALIDA`.
- Dos marcados simultáneos del mismo turno: uno responde 200 y el otro 409 `TRANSICION_INVALIDA`.

Fuera de alcance: deshacer un marcado, volver a `PROGRAMADO`, marcar turnos en lote, cargar observaciones clínicas, avisos por email, evento de dominio y la pantalla (C-17). No se modifican las reglas de solapamiento ni las `EXCLUDE`.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `turnos`: se agrega el registro de asistencia (`ATENDIDO`/`AUSENTE`) con la guarda de estado e inicio, el rechazo de transiciones inválidas y los estados finales que siguen ocupando el horario.

## Impact

- Backend `agenda/turnos`: entidad, servicio, controlador y un DTO de solicitud con un enum acotado a los dos estados. Sin migraciones y sin cambios en `TurnoResponse`: el `estado` ya se expone.
- API: endpoint nuevo; C-17 consume el contrato de la acción "Marcar asistencia".
- Los tests de integración corren contra `turnos_test` con `RelojMutable` para fijar la hora. No intervienen emails ni proveedores externos.

## Decisiones previas que se respetan

- `TransicionInvalidaException` (409 `TRANSICION_INVALIDA`) nació en C-10 para C-09 y C-11 y ya está en `agenda.turnos`.
- `TurnoRepository.buscarParaActualizar` (`PESSIMISTIC_WRITE`) quedó de C-09 y se reutiliza para serializar marcados concurrentes.
- Las `EXCLUDE` de V5 cuentan `PROGRAMADO`, `ATENDIDO` y `AUSENTE`: marcar asistencia no libera el horario.

> Leído antes: `CHANGES.md` §C-11, `knowledge-base/05_reglas_de_negocio.md` §RN-ES, `knowledge-base/07_flujos_principales.md` §Flujo 5, `knowledge-base/06_funcionalidades.md` §US-034 y el change archivado `2026-11-24-cancelar-turno`.
