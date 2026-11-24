# Evidencia · C-09 cancelar-turno

## Tests (tarea 4.1)

`./mvnw verify` en `backend/` (2026-11-24) contra PostgreSQL local `turnos_test`: **BUILD SUCCESS**, 70 tests unitarios y 172 de integración, sin fallas.

| Spec | Escenarios | Tests |
|---|---|---|
| `turnos` (delta, 8 requisitos) | 18 | `TurnoCancelacionIT` (17: motivo, sin cuerpo, en blanco, 255/256 caracteres, anticipada, tardía, límite exacto, límite de 48 h, horario liberado, ya cancelado, `ATENDIDO`, ya empezó, consulta de cancelado y no cancelado, inexistente, sin token) · `TurnoConcurrenciaIT.dosCancelacionesConcurrentesDelMismoTurno` (×5) |
| `pacientes` (delta MODIFIED "Baja lógica") | 4 | `PacienteIT`: `bajaConservaElRegistro` (sin cambios), `bajaBloqueadaPorUnTurnoProgramadoFuturo`, `bajaPermitidaDespuesDeCancelarElTurno`, `turnosPasadosNoBloqueanLaBaja` |

Unitarios: `TurnoTest` (anticipada, tardía, límite exacto, límite 0, motivo vacío → nulo, rechazo desde los 4 estados finales e inicio == ahora) y `ReglasAgendaTest.cancelacionTardia` (6 casos de límite). `TurnoIT.turnoExistente` verifica `motivoCancelacion` y `canceladoEn` nulos.

La concurrencia confirma el D3 del design: la segunda cancelación responde `TRANSICION_INVALIDA` (no `TURNO_MODIFICADO`), o sea que el `SELECT … FOR UPDATE` serializa y la segunda ve el turno ya cancelado.

## Prueba manual contra el backend (tarea 4.2)

Corrida el 2026-11-24 ~12:07 contra el backend local (`./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`) con el usuario inicial del `.env`, desde un script bash local fuera del repo (`curl`). Datos ficticios: pacientes "Prueba Ficticio C-09" (DNI 09900901) y "Prueba Ficticio C-09 Dos" (DNI 09900902), que quedaron dados de baja en la base de desarrollo.

| Paso | Pedido | Resultado |
|---|---|---|
| Baja de paciente con 2 turnos futuros | `DELETE /api/pacientes/6` | 409 `PACIENTE_CON_TURNOS_FUTUROS`, "El paciente tiene turnos programados. Cancelalos antes de darlo de baja." |
| Cancelar sin cuerpo un turno a +3 días (B) | `POST /api/turnos/7/cancelacion` | 200, `CANCELADO`, `motivoCancelacion` null, `canceladoEn` 2026-11-24T12:07:41-03:00 |
| Cancelar a <24 h (A, 2026-11-25 07:15) | `POST /api/turnos/6/cancelacion` `{}` | 200, `CANCELADO_TARDIO`, `version` 1 |
| Nuevo turno en el horario liberado de A | `POST /api/turnos` 2026-11-25 07:15 | 201 |
| Cancelar con motivo con tilde (archivo UTF-8) | `POST /api/turnos/9/cancelacion` `{"motivo":"Aviso por teléfono"}` | 200, `CANCELADO_TARDIO`, `motivoCancelacion` "Aviso por teléfono" |
| Baja de paciente sin turnos futuros | `DELETE /api/pacientes/6` | 204 |

Hallazgo de la prueba, **no es un defecto del backend**: en Windows, `curl.exe -d '{"motivo":"Aviso por teléfono"}'` escrito en la línea de comandos manda "é" en la página de códigos ANSI (no UTF-8) y la API responde 400 `SOLICITUD_INVALIDA` ("Failed to read request"), que es el manejo correcto de un JSON mal codificado. Con el cuerpo en un archivo UTF-8 (`--data-binary @archivo`) funciona. El navegador siempre envía UTF-8, así que C-17 no está afectado.

No cubierto a mano: "ya cancelado → 409" y "turno ya empezado → 409" (cubiertos por `TurnoCancelacionIT`).
