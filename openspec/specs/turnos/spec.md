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
