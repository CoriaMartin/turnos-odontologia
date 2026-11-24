# Spec Delta

## ADDED Requirements

### Requirement: Registrar asistencia de un turno
`POST /api/turnos/{id}/asistencia` SHALL registrar `ATENDIDO` o `AUSENTE` en un turno `PROGRAMADO` cuya hora actual sea mayor o igual al inicio, y responder 200 con el turno actualizado. El cuerpo SHALL ser `{ "estado": "ATENDIDO" | "AUSENTE" }` y la operación SHALL NOT exigir `version`. El turno SHALL conservar su `id`, paciente, prestación e intervalo, y SHALL pasar al estado informado (RN-ES-02).

#### Scenario: Marcar atendido a partir del inicio
- **GIVEN** la hora actual es 2026-11-30 09:00 y un turno `PROGRAMADO` del 2026-11-30 de 09:00 a 09:45
- **WHEN** se registra asistencia con `{ "estado": "ATENDIDO" }`
- **THEN** la respuesta tiene estado 200 con el mismo `id` e intervalo
- **AND** `estado` es `ATENDIDO`

#### Scenario: Marcar ausente exactamente en el inicio
- **GIVEN** la hora actual es 2026-11-30 09:00 y un turno `PROGRAMADO` del 2026-11-30 a las 09:00
- **WHEN** se registra asistencia con `{ "estado": "AUSENTE" }`
- **THEN** la respuesta tiene estado 200 y `estado` es `AUSENTE`

#### Scenario: Marcar después del fin del turno
- **GIVEN** la hora actual es 2026-11-30 09:00 y un turno `PROGRAMADO` del 2026-11-30 de 08:00 a 08:45
- **WHEN** se registra asistencia con `{ "estado": "ATENDIDO" }`
- **THEN** la respuesta tiene estado 200 y `estado` es `ATENDIDO`

### Requirement: Estado de asistencia válido
El campo `estado` SHALL ser obligatorio y SHALL admitir solo `ATENDIDO` o `AUSENTE`. Sin el campo, la API SHALL responder 422 con `codigo` `VALIDACION_FALLIDA` y `estado` en `errores`; con cualquier otro valor SHALL responder 400 con `codigo` `SOLICITUD_INVALIDA`. En ambos casos el turno SHALL quedar sin cambios.

#### Scenario: Falta el estado
- **GIVEN** un turno `PROGRAMADO` que ya empezó
- **WHEN** se envía `{}` a la asistencia
- **THEN** la respuesta tiene estado 422, `codigo` `VALIDACION_FALLIDA` y `errores` incluye el campo `estado`
- **AND** el turno sigue `PROGRAMADO`

#### Scenario: Estado no admitido
- **GIVEN** un turno `PROGRAMADO` que ya empezó
- **WHEN** se registra asistencia con `{ "estado": "PROGRAMADO" }`
- **THEN** la respuesta tiene estado 400 y `codigo` `SOLICITUD_INVALIDA`
- **AND** el turno sigue `PROGRAMADO`

### Requirement: Solo se registra asistencia de turnos programados que empezaron
Solo un turno `PROGRAMADO` con inicio menor o igual a la hora actual SHALL poder marcarse (RN-ES-02). Un inicio futuro o cualquier otro estado SHALL responder 409 `TRANSICION_INVALIDA` sin modificar el turno (RN-ES-04).

#### Scenario: Turno que todavía no empezó
- **GIVEN** la hora actual es 2026-11-30 08:59 y un turno `PROGRAMADO` del 2026-11-30 a las 09:00
- **WHEN** se registra asistencia con `ATENDIDO`
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`
- **AND** el turno sigue `PROGRAMADO`

#### Scenario: Doble marcado de un turno atendido
- **GIVEN** un turno `ATENDIDO`
- **WHEN** se intenta registrar asistencia con `AUSENTE`
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`
- **AND** el turno sigue `ATENDIDO`

#### Scenario: Turno marcado ausente
- **GIVEN** un turno `AUSENTE`
- **WHEN** se intenta registrar asistencia con `ATENDIDO`
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`
- **AND** el turno sigue `AUSENTE`

#### Scenario: Turno cancelado
- **GIVEN** un turno `CANCELADO`
- **WHEN** se intenta registrar asistencia con `ATENDIDO`
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`

#### Scenario: Turno cancelado tardíamente
- **GIVEN** un turno `CANCELADO_TARDIO`
- **WHEN** se intenta registrar asistencia con `AUSENTE`
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`

### Requirement: Los estados de asistencia son finales y siguen ocupando el horario
`ATENDIDO` y `AUSENTE` SHALL ser estados finales (RN-ES-02) y SHALL seguir ocupando el intervalo del turno para el profesional y el sillón (RN-AG-01). Después de marcar asistencia no SHALL poder crearse otro turno superpuesto en ese intervalo.

#### Scenario: Horario ocupado por un turno atendido
- **GIVEN** un turno del 2026-11-30 de 09:00 a 09:45 que pasó a `ATENDIDO`
- **WHEN** se crea otro turno el 2026-11-30 de 09:15 a 10:00
- **THEN** la respuesta tiene estado 409 y `codigo` `TURNO_SOLAPADO`

#### Scenario: Horario ocupado por un turno ausente
- **GIVEN** un turno del 2026-11-30 de 09:00 a 09:45 que pasó a `AUSENTE`
- **WHEN** se crea otro turno el 2026-11-30 de 09:00 a 09:45
- **THEN** la respuesta tiene estado 409 y `codigo` `TURNO_SOLAPADO`

### Requirement: Marcados simultáneos
Si llegan dos marcados de asistencia del mismo turno al mismo tiempo, exactamente uno SHALL responder 200 y el otro SHALL responder 409 `TRANSICION_INVALIDA`; el turno SHALL conservar el estado del marcado que respondió 200.

#### Scenario: Dos marcados concurrentes con estados distintos
- **GIVEN** un turno `PROGRAMADO` que ya empezó
- **WHEN** se envían dos marcados simultáneos, uno con `ATENDIDO` y otro con `AUSENTE`
- **THEN** uno responde 200 y el otro 409 `TRANSICION_INVALIDA`
- **AND** el estado guardado es el del marcado que respondió 200

### Requirement: Registrar asistencia de un turno inexistente y acceso
Registrar asistencia de un turno que no existe SHALL responder 404 `TURNO_NO_ENCONTRADO`, y la operación SHALL exigir autenticación.

#### Scenario: Turno inexistente
- **WHEN** se registra asistencia del turno 999999 con `ATENDIDO`
- **THEN** la respuesta tiene estado 404 y `codigo` `TURNO_NO_ENCONTRADO`

#### Scenario: Sin token
- **WHEN** se registra asistencia sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
