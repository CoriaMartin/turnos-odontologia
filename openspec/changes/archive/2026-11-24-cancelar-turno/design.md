# Design

## Context

C-07 y C-10 dejaron `Turno` (con `motivo_cancelacion`, `cancelado_en` y `version` en V5), `TurnoService`, `TransicionInvalidaException` (409, pensada para C-09/C-11), `TurnoModificadoException` y las `EXCLUDE` de V5 que solo cuentan `PROGRAMADO`, `ATENDIDO` y `AUSENTE`: pasar el turno a un estado cancelado ya libera el horario en la base. `Configuracion.horasCancelacionTardia` existe desde C-04 y se lee con `ConfiguracionService.obtener()`. `PacienteService.darDeBaja` (C-06) da de baja sin mirar turnos. `TurnoService` ya depende de `PacienteService`. El reloj del servidor es el `Clock` de `RelojConfig` (`America/Argentina/Buenos_Aires`), reemplazable por `RelojMutable` en tests. `open-in-view` está apagado. Motivación en [proposal.md](proposal.md); comportamiento en los deltas de `turnos` y `pacientes`.

## Goals / Non-Goals

**Goals:**
- Mantener la regla de la transición y del cálculo tardío en el dominio puro, probable sin base.
- Contrato idéntico al que asumió C-17 (design D2 de `ui-gestion-turnos`).
- Que la guarda RN-PA-04 no haga depender el módulo `pacientes` del módulo `agenda`.

**Non-Goals:**
- Evento de dominio de cancelación: C-13 relee el estado del turno antes de enviar (CHANGES.md), así que no lo necesita.
- Tocar la regla de no solapamiento ni las `EXCLUDE`.

## Decisions

### D1 — Sin `version` en la solicitud
La cancelación no edita datos que el usuario vio (horario, duración), sino que pasa el turno a un estado final; reenviarla sobre un turno ya cancelado responde `TRANSICION_INVALIDA`, que C-17 ya maneja invalidando la agenda. Exigir `version` solo agregaría un 409 `TURNO_MODIFICADO` más sin proteger nada que el estado no proteja.
- Caso límite aceptado: si el turno se reprogramó en otra pestaña a menos de 24 h, la cancelación sale `CANCELADO_TARDIO` aunque el aviso previo de C-17 no lo anticipara. La respuesta trae el estado real y C-17 anuncia "Turno cancelado con cancelación tardía".
- *Alternativa*: `version` obligatoria como en la reprogramación (C-10). Descartada por lo anterior y porque rompe el contrato acordado con C-17.

### D2 — Transición y cálculo en `Turno`
`Turno.cancelar(String motivo, Instant ahora, Duration limiteTardio)`:
1. `estado != PROGRAMADO` o `!inicio.isAfter(ahora)` → `TransicionInvalidaException` sin tocar nada.
2. `Duration.between(ahora, inicio).compareTo(limiteTardio) < 0` → `CANCELADO_TARDIO`; si no, `CANCELADO` (estrictamente menor, RN-CA-04).
3. Registra `canceladoEn = ahora` y el motivo normalizado.
- Con `horas_cancelacion_tardia = 0` nunca es tardía (el inicio es estrictamente futuro). La regla "menos de N horas" se puede extraer a `ReglasAgenda.esCancelacionTardia(inicio, ahora, limite)` para probarla junto a las demás reglas puras.
- El motivo se normaliza en la entidad: `strip()`; vacío → `null`. La longitud (≤ 255) la valida la API; la columna tiene además su `CHECK`.

### D3 — Concurrencia con bloqueo de fila
`TurnoRepository.buscarParaActualizar(id)` con `@Lock(PESSIMISTIC_WRITE)` (`SELECT … FOR UPDATE` solo sobre `turno`, sin `join fetch` para no bloquear filas de paciente ni prestación). Dos cancelaciones simultáneas se serializan: la segunda espera, lee el turno ya `CANCELADO*` y responde `TRANSICION_INVALIDA`, como pide la spec.
- No hace falta `BloqueoAgenda`: cancelar libera horario, nunca puede violar las `EXCLUDE`.
- Una reprogramación concurrente sigue protegida por `@Version`: si la cancelación confirma primero, la reprogramación falla con `TURNO_MODIFICADO` (C-10); si la reprogramación confirma primero, la cancelación espera el lock y calcula la anticipación con el inicio nuevo.
- `ObjectOptimisticLockingFailureException` no debería ocurrir con el lock tomado; si ocurre, se traduce a `TURNO_MODIFICADO` como en `guardar`.
- *Alternativa*: confiar solo en `@Version` y traducir el conflicto a `TRANSICION_INVALIDA`. Descartada: la segunda cancelación no sabría si el turno quedó cancelado o reprogramado, y el código de error mentiría.

### D4 — Flujo `TurnoService.cancelar(id, motivo)`
1. `buscarParaActualizar(id)` → 404 `TURNO_NO_ENCONTRADO`.
2. Lee `horasCancelacionTardia` de `ConfiguracionService` y `ahora` del `Clock`.
3. `turno.cancelar(motivo, ahora, Duration.ofHours(horas))`.
4. `saveAndFlush` y devuelve `buscarConDetalle(id)` (mismo contexto de persistencia: inicializa paciente y prestación para `TurnoResponse` con `open-in-view` apagado).
5. Log `Turno cancelado id={} estado={}`. **Nunca** se loguea el motivo: es texto libre y puede traer datos de salud (RN-DS, ley 26.529).

### D5 — API
- `POST /api/turnos/{id}/cancelacion` con `@Valid @RequestBody(required = false) CancelarTurnoRequest(@Size(max = 255) String motivo)` → 200 `TurnoResponse`. Sin cuerpo = sin motivo. `POST` sobre el subrecurso, como define la KB (02 §API REST).
- `TurnoResponse` suma `motivoCancelacion` (String) y `canceladoEn` (`OffsetDateTime` en la zona del consultorio). Cambio compatible: C-16 y C-17 ignoran campos que no usan.

### D6 — Guarda RN-PA-04 con un puerto en `pacientes`
- Interfaz `pacientes.TurnosDePaciente` con `boolean tieneProgramadosDesde(Long pacienteId, Instant ahora)`. La implementa un adaptador en `agenda.turnos` con una consulta `exists` sobre `turno` (`estado = PROGRAMADO and inicio > :ahora`; usa el índice `turno_paciente_idx`).
- `PacienteService.darDeBaja`: si el paciente está activo y el puerto devuelve `true` → `PacienteConTurnosFuturosException` (409 `PACIENTE_CON_TURNOS_FUTUROS`, mensaje "El paciente tiene turnos programados. Cancelalos antes de darlo de baja."). Ya inactivo → 204 sin consultar, como hoy.
- `PacienteService` suma el `Clock`. No hay ciclo de beans: el adaptador depende de `TurnoRepository`, no de `TurnoService`.
- *Alternativa*: inyectar `TurnoRepository` en `PacienteService`. Descartada: `pacientes` pasaría a depender de `agenda`, que ya depende de `pacientes`.
- "Futuro" = inicio estrictamente posterior a ahora, igual que la cancelación: un turno `PROGRAMADO` que ya empezó no bloquea (se resuelve con asistencia, C-11).

### D7 — Tests
- `TurnoTest` (unitario): anticipada, tardía, límite exacto, límite 0, motivo normalizado, y rechazo desde `CANCELADO`, `CANCELADO_TARDIO`, `ATENDIDO`, `AUSENTE` y con inicio == ahora.
- `TurnoCancelacionIT` (`@SpringBootTest` + MockMvc + `RelojMutable`, hora fija 2026-11-30 09:00, base `turnos_test`): un test por escenario del delta de `turnos`. Turnos creados por la API; los `ATENDIDO` y los que ya empezaron, por JDBC. La configuración de 48 h se ajusta por JDBC y se restaura al terminar.
- Concurrencia: dos hilos con `CountDownLatch` contra el servicio, siguiendo el patrón de `TurnoConcurrenciaIT`.
- `PacienteIT`: los tres escenarios nuevos de la baja.
- `TurnoIT`: `motivoCancelacion` y `canceladoEn` nulos en la consulta.

## Risks / Trade-offs

- [Carrera entre la baja de un paciente y el alta de un turno suyo] → la baja consulta y el alta valida "paciente activo" sin bloquearse entre sí; podría quedar un turno de un paciente inactivo. Con un solo usuario es improbable y el turno sigue siendo cancelable. Se acepta y se documenta.
- [`SELECT … FOR UPDATE` espera si otra transacción tiene la fila] → las transacciones de turnos son cortas; sin riesgo de deadlock porque la cancelación toma un único lock.
- [El motivo puede contener datos sensibles] → no se loguea; solo se devuelve a usuarios autenticados.

## Migration Plan

Sin migraciones: las columnas existen desde V5. Rollback: revertir el PR.

## UI Mockups

- Decision: no (no UI) — 2026-11-24. Change solo de backend; la pantalla de cancelación es C-17 (maqueta `cancelar.html` ya aprobada en su propuesta).
