# Spec Delta — turnos

## ADDED Requirements

### Requirement: Consultar la agenda por período
`GET /api/turnos?desde=&hasta=` SHALL devolver 200 con la lista de turnos cuyo intervalo `[inicio, fin)` se superpone con el período semiabierto `[desde, hasta)`, ordenados por inicio ascendente (y por id ante igual inicio). Cada turno SHALL incluir id, inicio, fin, estado, duración, `version` y el resumen de paciente (id, nombre, apellido) y de prestación (id, nombre), sin DNI ni datos de contacto.

#### Scenario: Turnos del período ordenados por inicio
- **GIVEN** turnos `PROGRAMADO` el 2026-12-01 a las 12:00, 10:00 y 11:00, y otro el 2026-12-02 a las 10:00
- **WHEN** se pide la agenda con `desde` 2026-12-01T00:00-03:00 y `hasta` 2026-12-02T00:00-03:00
- **THEN** la respuesta tiene estado 200 con exactamente los tres turnos del 2026-12-01, en el orden 10:00, 11:00, 12:00
- **AND** cada uno incluye estado, paciente (id, nombre, apellido) y prestación (id, nombre)

#### Scenario: Período sin turnos
- **GIVEN** ningún turno el 2026-12-05
- **WHEN** se pide la agenda de ese día
- **THEN** la respuesta tiene estado 200 con una lista vacía

#### Scenario: Turno que empieza justo en el inicio del período
- **GIVEN** un turno de 10:00 a 10:45
- **WHEN** se pide la agenda con `desde` 10:00 y `hasta` 12:00 del mismo día
- **THEN** el turno está en la lista

#### Scenario: Turno que termina justo en el inicio del período
- **GIVEN** un turno de 09:15 a 10:00
- **WHEN** se pide la agenda con `desde` 10:00 y `hasta` 12:00 del mismo día
- **THEN** el turno no está en la lista

#### Scenario: Turno que empieza justo en el fin del período
- **GIVEN** un turno de 12:00 a 12:45
- **WHEN** se pide la agenda con `desde` 10:00 y `hasta` 12:00 del mismo día
- **THEN** el turno no está en la lista

#### Scenario: Turno que cruza el inicio del período
- **GIVEN** un turno del 2026-12-01 de 23:30 a 00:15 del día siguiente
- **WHEN** se pide la agenda del 2026-12-02 (`desde` 00:00, `hasta` 00:00 del 2026-12-03)
- **THEN** el turno está en la lista

### Requirement: Filtro de turnos cancelados en la agenda
La agenda SHALL incluir por defecto los turnos de todos los estados. Con `incluirCancelados=false` SHALL omitir los turnos `CANCELADO` y `CANCELADO_TARDIO` y conservar los demás.

#### Scenario: Cancelados incluidos por defecto
- **GIVEN** en el período un turno `PROGRAMADO`, uno `CANCELADO` y uno `CANCELADO_TARDIO`
- **WHEN** se pide la agenda sin `incluirCancelados`
- **THEN** la lista contiene los tres turnos, cada uno con su estado

#### Scenario: Cancelados excluidos
- **GIVEN** en el período un turno `PROGRAMADO`, uno `CANCELADO` y uno `CANCELADO_TARDIO`
- **WHEN** se pide la agenda con `incluirCancelados=false`
- **THEN** la lista contiene solo el turno `PROGRAMADO`

### Requirement: Período de consulta válido
`desde` y `hasta` SHALL ser obligatorios, `hasta` SHALL ser posterior a `desde` y el período SHALL durar como máximo 31 días. Si no se cumple, la API SHALL responder 422 `VALIDACION_FALLIDA` con el campo afectado en `errores`. Una fecha que no sea ISO-8601 con zona horaria (RN-GL-01) SHALL responder 400 `SOLICITUD_INVALIDA`.

#### Scenario: Falta el período
- **WHEN** se pide `GET /api/turnos` sin `desde`
- **THEN** la respuesta tiene estado 422, `codigo` `VALIDACION_FALLIDA` y `errores` incluye el campo `desde`

#### Scenario: Fin anterior al inicio
- **WHEN** se pide la agenda con `desde` 2026-12-02T00:00-03:00 y `hasta` 2026-12-01T00:00-03:00
- **THEN** la respuesta tiene estado 422, `codigo` `VALIDACION_FALLIDA` y `errores` incluye el campo `hasta`

#### Scenario: Período vacío
- **WHEN** se pide la agenda con `desde` igual a `hasta`
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `hasta`

#### Scenario: Período de exactamente 31 días
- **WHEN** se pide la agenda con `desde` 2026-12-01T00:00-03:00 y `hasta` 2027-01-01T00:00-03:00
- **THEN** la respuesta tiene estado 200

#### Scenario: Período mayor a 31 días
- **WHEN** se pide la agenda con `desde` 2026-12-01T00:00-03:00 y `hasta` 2027-01-01T00:01-03:00
- **THEN** la respuesta tiene estado 422, `codigo` `VALIDACION_FALLIDA` y `errores` incluye el campo `hasta`

#### Scenario: Fecha sin zona horaria
- **WHEN** se pide la agenda con `desde` 2026-12-01T00:00 (sin zona)
- **THEN** la respuesta tiene estado 400 y `codigo` `SOLICITUD_INVALIDA`

### Requirement: La agenda exige autenticación
Consultar la agenda SHALL exigir un token válido.

#### Scenario: Agenda sin token
- **WHEN** se pide la agenda de un período sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
