# Spec Delta

## MODIFIED Requirements

### Requirement: Baja lógica
`DELETE /api/pacientes/{id}` SHALL marcar el paciente como inactivo y responder 204, conservando sus datos. Dar de baja un paciente ya inactivo SHALL responder 204 sin cambios. Si el paciente tiene turnos `PROGRAMADO` cuyo inicio todavía no llegó, la baja SHALL responder 409 `PACIENTE_CON_TURNOS_FUTUROS` y el paciente SHALL seguir activo (RN-PA-04).

#### Scenario: Baja conserva el registro
- **GIVEN** un paciente activo
- **WHEN** se lo da de baja
- **THEN** la respuesta tiene estado 204
- **AND** `GET /api/pacientes/{id}` sigue devolviéndolo con `activo` igual a `false`

#### Scenario: Baja bloqueada por un turno programado futuro
- **GIVEN** un paciente activo con un turno `PROGRAMADO` para mañana
- **WHEN** se lo da de baja
- **THEN** la respuesta tiene estado 409 y `codigo` `PACIENTE_CON_TURNOS_FUTUROS`
- **AND** el paciente sigue con `activo` igual a `true`

#### Scenario: Baja permitida después de cancelar el turno
- **GIVEN** un paciente activo cuyo único turno futuro se canceló
- **WHEN** se lo da de baja
- **THEN** la respuesta tiene estado 204

#### Scenario: Turnos pasados no bloquean la baja
- **GIVEN** un paciente activo cuyo único turno `PROGRAMADO` ya empezó
- **WHEN** se lo da de baja
- **THEN** la respuesta tiene estado 204
