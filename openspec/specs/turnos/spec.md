# turnos Specification

## Purpose

Permite al odontólogo crear turnos para sus pacientes con la garantía de que ningún profesional ni sillón queda con dos turnos superpuestos, aunque las solicitudes lleguen al mismo tiempo.

## Requirements

### Requirement: Crear un turno
`POST /api/turnos` con paciente, prestación e inicio SHALL crear un turno en estado `PROGRAMADO`, asignado al profesional y al sillón del consultorio, con `fin = inicio + duración`, y responder 201 con el turno.

#### Scenario: Turno en horario libre
- **GIVEN** un paciente activo, la prestación activa "Limpieza" de 45 minutos y la agenda libre el 2026-12-01
- **WHEN** se crea un turno para ese paciente con esa prestación a las 10:00
- **THEN** la respuesta tiene estado 201
- **AND** el turno queda `PROGRAMADO` de 10:00 a 10:45 con el profesional y el sillón del consultorio

### Requirement: Duración del turno
La duración SHALL ser la de la prestación salvo que se informe `duracionMinutos`, que SHALL estar entre 5 y 480. Fuera de ese rango la API SHALL responder 422 `VALIDACION_FALLIDA`.

#### Scenario: Duración editada
- **WHEN** se crea un turno de "Limpieza" (45 minutos) a las 10:00 con `duracionMinutos` 60
- **THEN** el turno termina a las 11:00

#### Scenario: Duración fuera de rango
- **WHEN** se crea un turno con `duracionMinutos` 500
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `duracionMinutos`

### Requirement: Sin solapamiento por profesional ni por sillón
El sistema SHALL rechazar un turno cuyo intervalo `[inicio, fin)` se superponga con otro turno `PROGRAMADO`, `ATENDIDO` o `AUSENTE` del mismo profesional o del mismo sillón, respondiendo 409 `TURNO_SOLAPADO` con el turno en conflicto. No existen sobreturnos.

#### Scenario: Solapamiento parcial
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45
- **WHEN** se intenta crear otro de 10:30 a 11:00
- **THEN** la respuesta tiene estado 409, `codigo` `TURNO_SOLAPADO` y `turnoEnConflicto` con el turno de 10:00 a 10:45
- **AND** no se crea ningún turno nuevo

#### Scenario: Solapamiento total
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 11:00
- **WHEN** se intenta crear otro de 10:15 a 10:45
- **THEN** la respuesta tiene estado 409 y `codigo` `TURNO_SOLAPADO`

#### Scenario: Turno que empieza justo cuando termina otro
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45
- **WHEN** se crea otro de 10:45 a 11:15
- **THEN** la respuesta tiene estado 201

#### Scenario: Turno que termina justo cuando empieza otro
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45
- **WHEN** se crea otro de 09:30 a 10:00
- **THEN** la respuesta tiene estado 201

### Requirement: Los turnos cancelados no ocupan el horario
Un turno `CANCELADO` o `CANCELADO_TARDIO` SHALL NOT impedir crear otro turno en el mismo intervalo.

#### Scenario: Horario de un turno cancelado
- **GIVEN** un turno `CANCELADO` de 10:00 a 10:45
- **WHEN** se crea un turno de 10:00 a 10:45
- **THEN** la respuesta tiene estado 201

### Requirement: No solapamiento ante solicitudes simultáneas
Si dos solicitudes intentan ocupar intervalos superpuestos al mismo tiempo, exactamente una SHALL crearse y la otra SHALL responder 409 `TURNO_SOLAPADO`.

#### Scenario: Dos creaciones concurrentes en el mismo horario
- **GIVEN** la agenda libre de 10:00 a 10:45
- **WHEN** dos solicitudes simultáneas crean un turno de 10:00 a 10:45
- **THEN** exactamente una responde 201 y la otra 409 `TURNO_SOLAPADO`
- **AND** en la base existe un solo turno en ese intervalo

### Requirement: No se dan turnos en el pasado
Un turno cuyo inicio sea anterior a la hora actual del servidor SHALL rechazarse con 422 `TURNO_EN_PASADO` (DD-12).

#### Scenario: Inicio en el pasado
- **GIVEN** la hora actual es 2026-12-01 12:00
- **WHEN** se intenta crear un turno el 2026-12-01 a las 11:00
- **THEN** la respuesta tiene estado 422 y `codigo` `TURNO_EN_PASADO`

### Requirement: Paciente y prestación válidos
El paciente y la prestación SHALL existir y estar activos. Si no existen SHALL responder 404 (`PACIENTE_NO_ENCONTRADO`, `PRESTACION_NO_ENCONTRADA`); si están inactivos, 422 (`PACIENTE_INACTIVO`, `PRESTACION_INACTIVA`).

#### Scenario: Paciente dado de baja
- **GIVEN** un paciente dado de baja
- **WHEN** se intenta crearle un turno
- **THEN** la respuesta tiene estado 422 y `codigo` `PACIENTE_INACTIVO`

#### Scenario: Prestación inactiva
- **GIVEN** una prestación desactivada
- **WHEN** se intenta crear un turno con ella
- **THEN** la respuesta tiene estado 422 y `codigo` `PRESTACION_INACTIVA`

#### Scenario: Paciente inexistente
- **WHEN** se intenta crear un turno para el paciente 999999
- **THEN** la respuesta tiene estado 404 y `codigo` `PACIENTE_NO_ENCONTRADO`

### Requirement: Datos obligatorios de la solicitud
Paciente, prestación e inicio SHALL ser obligatorios, y el inicio SHALL incluir zona horaria (RN-GL-01). En caso contrario la API SHALL responder 422 o 400 según corresponda.

#### Scenario: Sin inicio
- **WHEN** se intenta crear un turno sin `inicio`
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `inicio`

### Requirement: Consultar un turno
`GET /api/turnos/{id}` SHALL devolver el turno con su paciente, prestación, inicio, fin y estado. Si no existe SHALL responder 404 `TURNO_NO_ENCONTRADO`. Ambas operaciones exigen autenticación.

#### Scenario: Turno existente
- **GIVEN** un turno creado
- **WHEN** se pide `GET /api/turnos/{id}`
- **THEN** la respuesta tiene estado 200 con su inicio, fin, estado, paciente y prestación

#### Scenario: Turno inexistente
- **WHEN** se pide `GET /api/turnos/999999`
- **THEN** la respuesta tiene estado 404 y `codigo` `TURNO_NO_ENCONTRADO`

#### Scenario: Sin token
- **WHEN** se intenta crear un turno sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
