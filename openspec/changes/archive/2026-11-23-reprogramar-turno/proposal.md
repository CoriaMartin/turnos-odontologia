# Proposal

## Why

Los pacientes piden cambiar de horario con frecuencia. Hoy, con C-07, solo se puede crear un turno: cambiarlo obligaría a borrarlo (no existe) o cancelarlo (C-09) y crear otro, perdiendo el mismo turno, su historial y su recordatorio. RN-ES-03 pide reprogramar conservando el turno y revalidando todas las reglas de agenda. C-10 es del líder en la tanda 6 y desbloquea C-13 (recordatorios), que reacciona a las reprogramaciones.

## What Changes

- `PUT /api/turnos/{id}/reprogramacion` con nuevo `inicio`, `duracionMinutos` opcional (por defecto la duración actual del turno) y la `version` del turno que vio el cliente.
- Solo se reprograma un turno `PROGRAMADO` cuyo inicio original todavía no llegó; si no, `TRANSICION_INVALIDA` (409).
- Revalida RN-AG-01 a RN-AG-06 con el nuevo horario, **excluyendo al propio turno** de la comparación: se puede mover dentro de su mismo intervalo.
- Bloqueo optimista: si la `version` enviada no coincide con la actual, `TURNO_MODIFICADO` (409) sin cambios.
- Publica el evento de dominio `TurnoReprogramado` (turno, inicio anterior e inicio nuevo) al confirmar; lo consumirá C-13 para reiniciar el recordatorio (RN-RE-05).
- `TurnoResponse` incorpora `version` para que el cliente pueda reprogramar.
- `TransicionInvalidaException` queda disponible para C-09 (cancelar) y C-11 (asistencia).

Fuera de alcance: cancelar (C-09), asistencia (C-11), recordatorios (C-13), pantalla (C-17), cambiar paciente o prestación de un turno (no lo pide la KB).

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `turnos`: se agregan la reprogramación de un turno, su bloqueo optimista y la `version` en la consulta.

## Impact

- Código en `backend/.../agenda/turnos` (entidad, servicio, consulta de conflictos, controlador). Sin migraciones: `version` ya existe en la tabla `turno` (V5).
- `TurnoResponse` suma el campo `version` (cambio compatible).
- C-09 y C-11 reutilizan `TransicionInvalidaException`; C-13 escucha `TurnoReprogramado`.
