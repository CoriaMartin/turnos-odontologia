# Spec Delta

## ADDED Requirements

### Requirement: Cancelar un turno
`POST /api/turnos/{id}/cancelacion` SHALL cancelar un turno `PROGRAMADO` cuyo inicio todavía no llegó y responder 200 con el turno actualizado. El cuerpo es opcional y solo admite `motivo`; la operación SHALL NOT exigir `version`. El turno SHALL conservar su `id`, paciente, prestación e intervalo, y SHALL registrar `canceladoEn` con la hora del servidor.

#### Scenario: Cancelación con motivo
- **GIVEN** la hora actual es 2026-11-30 09:00 y un turno `PROGRAMADO` del 2026-12-01 de 10:00 a 10:45
- **WHEN** se lo cancela con `{ "motivo": "Viaje imprevisto" }`
- **THEN** la respuesta tiene estado 200 con el mismo `id` e intervalo
- **AND** `motivoCancelacion` es "Viaje imprevisto" y `canceladoEn` es 2026-11-30 09:00

#### Scenario: Cancelación sin cuerpo
- **GIVEN** un turno `PROGRAMADO` futuro
- **WHEN** se lo cancela sin cuerpo en la solicitud
- **THEN** la respuesta tiene estado 200 y `motivoCancelacion` es nulo

#### Scenario: Motivo en blanco
- **GIVEN** un turno `PROGRAMADO` futuro
- **WHEN** se lo cancela con `{ "motivo": "   " }`
- **THEN** la respuesta tiene estado 200 y `motivoCancelacion` es nulo

### Requirement: Motivo de cancelación acotado
El `motivo` SHALL tener como máximo 255 caracteres (RN-CA-03). Un motivo más largo SHALL responder 422 con el campo `motivo` en `errores` y el turno SHALL quedar sin cambios.

#### Scenario: Motivo demasiado largo
- **GIVEN** un turno `PROGRAMADO` futuro
- **WHEN** se lo cancela con un `motivo` de 256 caracteres
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `motivo`
- **AND** el turno sigue `PROGRAMADO`

#### Scenario: Motivo de exactamente 255 caracteres
- **GIVEN** un turno `PROGRAMADO` futuro
- **WHEN** se lo cancela con un `motivo` de 255 caracteres
- **THEN** la respuesta tiene estado 200 y `motivoCancelacion` tiene esos 255 caracteres

### Requirement: Cancelación anticipada o tardía
El estado resultante SHALL ser `CANCELADO_TARDIO` si faltan **menos** de las horas de cancelación tardía configuradas para el consultorio (por defecto 24) entre la hora actual y el inicio del turno, y `CANCELADO` en cualquier otro caso, incluido exactamente el límite (RN-CA-01, RN-CA-04).

#### Scenario: Cancelación anticipada
- **GIVEN** la hora actual es 2026-11-30 09:00, 24 horas de cancelación tardía y un turno `PROGRAMADO` del 2026-12-01 a las 10:00
- **WHEN** se lo cancela
- **THEN** el turno queda `CANCELADO`

#### Scenario: Cancelación tardía
- **GIVEN** la hora actual es 2026-11-30 09:00, 24 horas de cancelación tardía y un turno `PROGRAMADO` del 2026-11-30 a las 20:00
- **WHEN** se lo cancela
- **THEN** el turno queda `CANCELADO_TARDIO`

#### Scenario: Exactamente en el límite
- **GIVEN** la hora actual es 2026-11-30 09:00, 24 horas de cancelación tardía y un turno `PROGRAMADO` del 2026-12-01 a las 09:00
- **WHEN** se lo cancela
- **THEN** el turno queda `CANCELADO`

#### Scenario: Límite configurado distinto
- **GIVEN** la hora actual es 2026-11-30 09:00, 48 horas de cancelación tardía y un turno `PROGRAMADO` del 2026-12-01 a las 10:00
- **WHEN** se lo cancela
- **THEN** el turno queda `CANCELADO_TARDIO`

### Requirement: La cancelación libera el horario
Al confirmarse la cancelación, el turno SHALL dejar de ocupar su horario en ese mismo momento (RN-AG-10, RN-CA-02), sea `CANCELADO` o `CANCELADO_TARDIO`.

#### Scenario: Nuevo turno en el horario liberado
- **GIVEN** un turno `PROGRAMADO` del 2026-11-30 de 20:00 a 20:45 que se cancela como `CANCELADO_TARDIO`
- **WHEN** se crea otro turno el 2026-11-30 de 20:00 a 20:45
- **THEN** la respuesta tiene estado 201

### Requirement: Solo se cancelan turnos programados y futuros
Solo un turno `PROGRAMADO` cuyo inicio todavía no llegó SHALL poder cancelarse (RN-ES-02). En cualquier otro caso SHALL responder 409 `TRANSICION_INVALIDA` sin modificar el turno (RN-ES-04).

#### Scenario: Turno ya cancelado
- **GIVEN** un turno `CANCELADO`
- **WHEN** se intenta cancelarlo de nuevo con otro motivo
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`
- **AND** el turno conserva su estado, su motivo y su `canceladoEn` originales

#### Scenario: Turno en estado final de asistencia
- **GIVEN** un turno `ATENDIDO`
- **WHEN** se intenta cancelarlo
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`

#### Scenario: Turno que ya empezó
- **GIVEN** un turno `PROGRAMADO` cuyo inicio es exactamente la hora actual
- **WHEN** se intenta cancelarlo
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`
- **AND** el turno sigue `PROGRAMADO`

### Requirement: Cancelaciones simultáneas
Si llegan dos cancelaciones del mismo turno al mismo tiempo, exactamente una SHALL responder 200 y la otra SHALL responder 409 `TRANSICION_INVALIDA`; el turno SHALL quedar con los datos de la cancelación que se confirmó.

#### Scenario: Dos cancelaciones concurrentes
- **GIVEN** un turno `PROGRAMADO` futuro
- **WHEN** se envían dos cancelaciones simultáneas con motivos distintos
- **THEN** una responde 200 y la otra 409 `TRANSICION_INVALIDA`
- **AND** el `motivoCancelacion` guardado es el de la que respondió 200

### Requirement: Datos de cancelación en la consulta
La respuesta de un turno (consulta, agenda, alta, reprogramación y cancelación) SHALL incluir `motivoCancelacion` y `canceladoEn`, nulos si el turno no se canceló.

#### Scenario: Turno cancelado consultado
- **GIVEN** un turno cancelado con motivo "Viaje imprevisto"
- **WHEN** se pide `GET /api/turnos/{id}`
- **THEN** la respuesta incluye su estado de cancelación, `motivoCancelacion` y `canceladoEn`

#### Scenario: Turno no cancelado
- **GIVEN** un turno `PROGRAMADO`
- **WHEN** se pide `GET /api/turnos/{id}`
- **THEN** `motivoCancelacion` y `canceladoEn` son nulos

### Requirement: Cancelar un turno inexistente y acceso
Cancelar un turno que no existe SHALL responder 404 `TURNO_NO_ENCONTRADO`, y la operación SHALL exigir autenticación.

#### Scenario: Turno inexistente
- **WHEN** se cancela el turno 999999
- **THEN** la respuesta tiene estado 404 y `codigo` `TURNO_NO_ENCONTRADO`

#### Scenario: Sin token
- **WHEN** se cancela un turno sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
