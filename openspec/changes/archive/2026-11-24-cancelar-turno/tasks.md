# Tasks

> Governance MEDIO: checkpoint con el usuario al terminar cada grupo. Tests de integración contra `turnos_test` (sin H2 ni Testcontainers).

## 1. Dominio de la cancelación

- [x] 1.1 Agregar `ReglasAgenda.esCancelacionTardia(inicio, ahora, limite)` (estrictamente menor) y `Turno.cancelar(motivo, ahora, limiteTardio)` con normalización del motivo y getters `motivoCancelacion` / `canceladoEn` (D2); verificar con `ReglasAgendaTest` y `TurnoTest`: anticipada, tardía, límite exacto, límite 0, motivo en blanco → nulo, y rechazo desde `CANCELADO`, `CANCELADO_TARDIO`, `ATENDIDO`, `AUSENTE` e inicio == ahora sin modificar el turno

## 2. Servicio y API de cancelación

- [x] 2.1 Agregar `TurnoRepository.buscarParaActualizar` con `PESSIMISTIC_WRITE` y `TurnoService.cancelar(id, motivo)` según D3/D4 (configuración, `Clock`, 404, traducción de `@Version`, log sin motivo); verificar que compila y que los tests de C-07, C-08 y C-10 siguen en verde
- [x] 2.2 Crear `CancelarTurnoRequest` (`@Size(max = 255)`), `POST /api/turnos/{id}/cancelacion` con cuerpo opcional y sumar `motivoCancelacion` y `canceladoEn` a `TurnoResponse` (D5); verificar con `TurnoCancelacionIT` un test por escenario del delta de `turnos` (con motivo, sin cuerpo, motivo en blanco, 256 y 255 caracteres, anticipada, tardía, límite exacto, límite de 48 h, horario liberado, ya cancelado, `ATENDIDO`, ya empezó, consulta de cancelado y no cancelado, inexistente, sin token) y en `TurnoIT` los campos nulos
- [x] 2.3 Test de dos cancelaciones simultáneas del mismo turno (patrón de `TurnoConcurrenciaIT`); verificar que una responde 200, la otra 409 `TRANSICION_INVALIDA` y que el motivo guardado es el de la 200

## 3. Guarda RN-PA-04 en la baja de paciente

- [x] 3.1 Crear el puerto `pacientes.TurnosDePaciente`, su adaptador en `agenda.turnos` (consulta `exists` de `PROGRAMADO` con inicio > ahora), `PacienteConTurnosFuturosException` (409 `PACIENTE_CON_TURNOS_FUTUROS`) y la guarda en `PacienteService.darDeBaja` con `Clock` (D6); verificar con `PacienteIT` los escenarios "Baja bloqueada por un turno programado futuro", "Baja permitida después de cancelar el turno" y "Turnos pasados no bloquean la baja", y que "Baja conserva el registro" sigue en verde

## 4. Verificación integral

- [x] 4.1 Correr `./mvnw verify` completo en `backend/` y confirmar que pasa y que cada escenario de los deltas de `turnos` y `pacientes` tiene su test
- [x] 4.2 Prueba manual con el backend local: crear un turno, cancelarlo con `curl` con y sin cuerpo, ver el estado en `GET /api/turnos/{id}` y la baja bloqueada del paciente; registrar los comandos y respuestas en `evidencia.md` (enlazado desde el PR)

## Workflow follow-up

- Avisar a C-17 (`ui-gestion-turnos`, tarea 0.3) que el contrato quedó confirmado tal como lo asumió, más `motivoCancelacion` y `canceladoEn` en `TurnoResponse`; y a C-15 el 409 `PACIENTE_CON_TURNOS_FUTUROS` para el diálogo de baja.
- Archivar el change (`openspec archive cancelar-turno`) y sincronizar specs.
- Marcar `[x]` en C-09 de `CHANGES.md` en el mismo PR.
- Abrir PR `agus/C-09-cancelar-turno` → `main`.
