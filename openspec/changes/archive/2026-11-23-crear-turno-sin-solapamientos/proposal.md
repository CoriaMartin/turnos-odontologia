# Proposal

## Why

El problema central del odontólogo independiente son los turnos superpuestos ([discovery](../../../discovery/discovery.md)). Este change entrega la primera funcionalidad de agenda: crear un turno garantizando que no choque con otro del mismo profesional ni del mismo sillón, aun ante solicitudes simultáneas.

**Por qué este change para el ciclo OPSX** (consigna): es el ejemplo recomendado, pertenece al MVP imprescindible del informe (§D.4, agenda con control de conflictos), tiene reglas verificables con escenarios feliz, de error de negocio y de borde (un turno que empieza justo cuando termina otro), y es una sola funcionalidad. Relevamiento previo en [explore.md](explore.md).

## What Changes

- Migración `V5__turnos.sql`: tabla `turno` con FK a paciente, profesional, sillón y prestación; `CHECK (fin > inicio)`; estados; `version` para bloqueo optimista; y dos restricciones `EXCLUDE USING gist` (profesional y sillón) sobre `tstzrange(inicio, fin, '[)')` para los estados que ocupan horario.
- Dominio puro (sin Spring): `Intervalo` semiabierto con `seSuperponeCon`, `EstadoTurno` y `Turno` que nace en `PROGRAMADO` con `fin = inicio + duración`.
- `TurnoService.crear`: valida paciente y prestación activos, inicio no pasado (reloj inyectable), duración 5–480 (por defecto la de la prestación), solapamiento por profesional y por sillón; traduce la violación de exclusión de la base al mismo error.
- Endpoints autenticados: `POST /api/turnos` (201) y `GET /api/turnos/{id}`.
- Errores: `TURNO_SOLAPADO` (409, con el turno en conflicto), `TURNO_EN_PASADO` (422), `PACIENTE_INACTIVO` (422), `PRESTACION_INACTIVA` (422), `PACIENTE_NO_ENCONTRADO` / `PRESTACION_NO_ENCONTRADA` (404), `TURNO_NO_ENCONTRADO` (404).

Fuera de alcance: listar la agenda (C-08), cancelar (C-09), reprogramar (C-10), registrar asistencia (C-11), recordatorios (C-13), pantallas (C-16/C-17), sobreturnos (prohibidos, RN-AG-04).

**Dependencia**: requiere C-05 (`prestacion`) mergeado antes de apply.

## Capabilities

### New Capabilities
- `turnos`: creación y consulta de turnos con la garantía de no solapamiento por profesional y por sillón.

### Modified Capabilities
- Ninguna.

## Impact

- Código nuevo en `backend/.../agenda` y migración `V5__turnos.sql`.
- `PacienteIT` debe borrar turnos antes de pacientes por la nueva FK.
- Sin dependencias nuevas.
- C-08 a C-11 y C-13 se construyen sobre `Turno`, `EstadoTurno` y `TurnoResponse`.
