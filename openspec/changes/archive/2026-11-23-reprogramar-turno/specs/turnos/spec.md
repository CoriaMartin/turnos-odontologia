# Spec Delta

## ADDED Requirements

### Requirement: Reprogramar un turno
`PUT /api/turnos/{id}/reprogramacion` con un nuevo `inicio` y la `version` actual SHALL mover un turno `PROGRAMADO` al nuevo horario conservando su `id`, paciente, prestación y estado, y responder 200 con el turno actualizado. Si no se informa `duracionMinutos`, se conserva la duración actual del turno; si se informa, SHALL estar entre 5 y 480.

#### Scenario: Reprogramación a un horario libre
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45 del 2026-12-01
- **WHEN** se lo reprograma a las 12:00 con su `version` actual
- **THEN** la respuesta tiene estado 200
- **AND** el mismo turno queda `PROGRAMADO` de 12:00 a 12:45

#### Scenario: Reprogramación con otra duración
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45
- **WHEN** se lo reprograma a las 12:00 con `duracionMinutos` 60
- **THEN** el turno queda de 12:00 a 13:00

#### Scenario: Datos obligatorios
- **WHEN** se reprograma un turno sin `inicio` o sin `version`
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo faltante

### Requirement: La reprogramación respeta el no solapamiento
El nuevo horario SHALL cumplir RN-AG-01 a RN-AG-04 comparándose con los demás turnos que ocupan horario, **excluyendo al propio turno**. Si choca con otro, SHALL responder 409 `TURNO_SOLAPADO` con el turno en conflicto y el turno SHALL quedar sin cambios.

#### Scenario: Nuevo horario que solapa con otro turno
- **GIVEN** un turno A de 10:00 a 10:45 y un turno B de 12:00 a 12:45
- **WHEN** se reprograma A a las 12:30
- **THEN** la respuesta tiene estado 409, `codigo` `TURNO_SOLAPADO` y `turnoEnConflicto` es B
- **AND** A sigue de 10:00 a 10:45

#### Scenario: Mover dentro de su propio intervalo
- **GIVEN** un turno `PROGRAMADO` de 10:00 a 10:45 y ningún otro turno
- **WHEN** se lo reprograma a las 10:15
- **THEN** la respuesta tiene estado 200 y el turno queda de 10:15 a 11:00

#### Scenario: Nuevo horario adyacente a otro turno
- **GIVEN** un turno A de 10:00 a 10:45 y un turno B de 12:00 a 12:45
- **WHEN** se reprograma A para que empiece a las 12:45
- **THEN** la respuesta tiene estado 200

### Requirement: No se reprograma al pasado
Un nuevo `inicio` anterior a la hora actual SHALL rechazarse con 422 `TURNO_EN_PASADO` (RN-AG-06, DD-12).

#### Scenario: Nuevo inicio en el pasado
- **GIVEN** la hora actual es 2026-11-30 09:00 y un turno `PROGRAMADO` del 2026-12-01 a las 10:00
- **WHEN** se lo reprograma al 2026-11-30 a las 08:00
- **THEN** la respuesta tiene estado 422 y `codigo` `TURNO_EN_PASADO`

### Requirement: Solo turnos programados y futuros
Solo un turno `PROGRAMADO` cuyo inicio original todavía no llegó SHALL poder reprogramarse (RN-ES-03). En cualquier otro caso SHALL responder 409 `TRANSICION_INVALIDA` sin modificar el turno.

#### Scenario: Turno cancelado
- **GIVEN** un turno `CANCELADO`
- **WHEN** se intenta reprogramarlo
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`

#### Scenario: Turno que ya empezó
- **GIVEN** un turno `PROGRAMADO` cuyo inicio ya pasó
- **WHEN** se intenta reprogramarlo a un horario futuro
- **THEN** la respuesta tiene estado 409 y `codigo` `TRANSICION_INVALIDA`

### Requirement: Edición concurrente
Si la `version` enviada no coincide con la actual del turno (otro cambio se guardó antes), la reprogramación SHALL responder 409 `TURNO_MODIFICADO` sin modificar el turno.

#### Scenario: Version desactualizada
- **GIVEN** un turno con `version` 0 que se reprogramó una vez y ahora tiene `version` 1
- **WHEN** se intenta reprogramarlo enviando `version` 0
- **THEN** la respuesta tiene estado 409 y `codigo` `TURNO_MODIFICADO`
- **AND** el turno conserva el horario de la primera reprogramación

### Requirement: Aviso de reprogramación
Al confirmarse una reprogramación, el sistema SHALL publicar un evento `TurnoReprogramado` con el id del turno, el inicio anterior y el inicio nuevo, para que otros módulos (recordatorios, C-13) reaccionen. Una reprogramación rechazada SHALL NOT publicar el evento.

#### Scenario: Evento publicado
- **WHEN** se reprograma un turno de las 10:00 a las 12:00
- **THEN** se publica un `TurnoReprogramado` con ese turno, inicio anterior 10:00 e inicio nuevo 12:00

#### Scenario: Sin evento si se rechaza
- **WHEN** una reprogramación se rechaza por `TURNO_SOLAPADO`
- **THEN** no se publica ningún `TurnoReprogramado`

### Requirement: Turno inexistente y acceso
Reprogramar un turno que no existe SHALL responder 404 `TURNO_NO_ENCONTRADO`, y la operación SHALL exigir autenticación.

#### Scenario: Turno inexistente
- **WHEN** se reprograma el turno 999999
- **THEN** la respuesta tiene estado 404 y `codigo` `TURNO_NO_ENCONTRADO`

#### Scenario: Sin token
- **WHEN** se reprograma un turno sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

## MODIFIED Requirements

### Requirement: Consultar un turno
`GET /api/turnos/{id}` SHALL devolver el turno con su paciente, prestación, inicio, fin, estado y `version`. Si no existe SHALL responder 404 `TURNO_NO_ENCONTRADO`. Ambas operaciones exigen autenticación.

#### Scenario: Turno existente
- **GIVEN** un turno creado
- **WHEN** se pide `GET /api/turnos/{id}`
- **THEN** la respuesta tiene estado 200 con su inicio, fin, estado, paciente, prestación y `version`

#### Scenario: Turno inexistente
- **WHEN** se pide `GET /api/turnos/999999`
- **THEN** la respuesta tiene estado 404 y `codigo` `TURNO_NO_ENCONTRADO`

#### Scenario: Sin token
- **WHEN** se intenta crear un turno sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
