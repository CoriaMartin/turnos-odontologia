# Design

## Context

C-07 a C-10 dejaron `Turno` (`version` en V5), `TurnoService`, `TransicionInvalidaException` (409 `TRANSICION_INVALIDA`, ya reutilizada por C-09), `TurnoModificadoException` y `TurnoRepository.buscarParaActualizar` con `PESSIMISTIC_WRITE` de C-09. El `Clock` del servidor es el de `RelojConfig` (`America/Argentina/Buenos_Aires`), reemplazable por `RelojMutable` en tests. `TurnoResponse` ya expone `estado`, `version`, `motivoCancelacion` y `canceladoEn`, y las `EXCLUDE` de V5 cuentan `PROGRAMADO`, `ATENDIDO` y `AUSENTE`. `GlobalExceptionHandler` responde 422 `VALIDACION_FALLIDA` para `@Valid` y 400 `SOLICITUD_INVALIDA` para valores de enum no deserializables. `open-in-view` está apagado. Motivación en [proposal.md](proposal.md); comportamiento en el delta de `turnos`.

## Goals / Non-Goals

**Goals:**
- Mantener la guarda de la transición en el dominio puro, sin base: estado `PROGRAMADO` e `inicio <= ahora`.
- Reutilizar el mecanismo de concurrencia de C-09 sin tocar las reglas de solapamiento.
- Contrato simple para la acción "Marcar asistencia" de C-17: un campo, sin `version`.

**Non-Goals:**
- Evento de dominio ni aviso por email: C-13 solo busca turnos `PROGRAMADO` y relee el estado.
- Nuevos campos, migraciones o marcas de fecha de asistencia: la KB no las pide.
- Deshacer el marcado ni marcar turnos en lote.

## Decisions

### D1 — Enum acotado en la solicitud
`RegistrarAsistenciaRequest(@NotNull EstadoAsistencia estado)`, con `EstadoAsistencia` en `agenda.turnos.web` y solo los valores `ATENDIDO` y `AUSENTE`, convertibles a `EstadoTurno`. Así los valores `PROGRAMADO`, `CANCELADO` y `CANCELADO_TARDIO` se rechazan al deserializar (400 `SOLICITUD_INVALIDA`) y no llegan al dominio. Falta de `estado` → 422 con `errores` (D5).
- *Alternativa*: recibir `EstadoTurno` y validar en el servicio. Descartada: aceptaría estados inválidos en el DTO y exigiría un error de negocio para un problema de solicitud.

### D2 — Transición en `Turno`
`Turno.registrarAsistencia(EstadoAsistencia estado, Instant ahora)`:
1. `estado != PROGRAMADO` → `TransicionInvalidaException("Solo se puede registrar asistencia de turnos programados.")`.
2. `ahora.isBefore(inicio)` → `TransicionInvalidaException("El turno todavía no empezó.")`. En `ahora == inicio` se permite: RN-ES-02 dice "a partir del inicio", a diferencia de cancelar, que exige inicio estrictamente futuro.
3. `this.estado = estado.aEstadoTurno()`. El intervalo, las relaciones y `version` no se tocan a mano; JPA incrementa `version` en el `UPDATE`.
- Sin límite superior: marcar después del `fin` o días después está permitido porque la KB no define otro plazo. No se agrega una regla nueva.
- `ATENDIDO` y `AUSENTE` son finales: cualquier segundo marcado cae en el paso 1.
- *Alternativa*: meter la validación en el servicio. Descartada: rompe el patrón de `reprogramar` y `cancelar`, que mantienen la regla en la entidad.

### D3 — Concurrencia con bloqueo de fila, sin `BloqueoAgenda`
Se reutiliza `TurnoRepository.buscarParaActualizar(id)` (`SELECT … FOR UPDATE` sobre `turno`, sin `join fetch`). Dos marcados simultáneos se serializan: el segundo lee el estado final y responde `TRANSICION_INVALIDA`.
- No se consultan conflictos ni se toma `BloqueoAgenda`: asistencia no cambia el intervalo y `ATENDIDO`/`AUSENTE` siguen ocupando el horario, así que las `EXCLUDE` no se ven afectadas.
- Carrera con cancelación o reprogramación: con la fila bloqueada, la operación que llega segunda ve el estado final y responde `TRANSICION_INVALIDA`; si la reprogramación leyó una `version` vieja antes del bloqueo, responde `TURNO_MODIFICADO` por `@Version`. Se acepta: el cliente debe refrescar la agenda.
- `ObjectOptimisticLockingFailureException` se traduce a `TURNO_MODIFICADO` igual que en `cancelar`.

### D4 — Flujo `TurnoService.registrarAsistencia(id, estado)`
1. `buscarParaActualizar(id)` → 404 `TURNO_NO_ENCONTRADO`.
2. `turno.registrarAsistencia(estado, reloj.instant())`.
3. `saveAndFlush` y traducción de `@Version`; sin `BloqueoAgenda` ni publicación de eventos.
4. Log `Asistencia registrada id={} estado={}`. **Nunca** se loguean datos del paciente (RN-DS).
5. `buscarConDetalle(id)` para inicializar paciente y prestación en la respuesta con `open-in-view` apagado.

### D5 — API
- `POST /api/turnos/{id}/asistencia` con `@Valid @RequestBody RegistrarAsistenciaRequest` → 200 `TurnoResponse`. Verbo `POST` sobre el subrecurso, igual que la cancelación y como define la KB (02 §API REST).
- Sin `version` en el cuerpo: marcado y reintentos los protege el estado final (como en C-09). Reenviar sobre un turno ya marcado responde `TRANSICION_INVALIDA`, que C-17 ya maneja invalidando la agenda.
- `TurnoResponse` no cambia: el `estado` actualizado alcanza para la pantalla. Cambio compatible con C-16 y C-17.

### D6 — Tests
- `TurnoTest` (unitario): marcado en `inicio`, después del `fin`, y rechazo con inicio futuro y desde `ATENDIDO`, `AUSENTE`, `CANCELADO` y `CANCELADO_TARDIO` sin modificar el turno.
- `TurnoAsistenciaIT` (`@SpringBootTest` + MockMvc + `RelojMutable`, hora fija 2026-11-30 09:00, base `turnos_test`): un test por escenario del delta. Los turnos `PROGRAMADO` se crean por la API; los que ya empezaron y los estados finales se preparan por JDBC (el alta prohíbe inicios pasados). Se limpia la tabla `turno` antes y después.
- Concurrencia: dos hilos con `CountDownLatch` contra el servicio, siguiendo el patrón de `TurnoConcurrenciaIT`.
- `TurnoIT` (C-07) sigue en verde sin cambios de `TurnoResponse`.

## Risks / Trade-offs

- [Se puede marcar asistencia mucho después del turno] → la KB no fija un plazo máximo; se documenta en la spec y se evita inventar una regla. Un marcado tardío no cambia el horario ya ocupado.
- [Un marcado y una cancelación llegan juntos] → el lock de fila decide el orden; el perdedor recibe `TRANSICION_INVALIDA`. Se acepta porque hay un solo usuario y la respuesta trae el estado real.
- [No se guarda cuándo se marcó la asistencia] → no es necesario para US-034 ni para RN-ES; se agregaría como change nuevo si el consultorio lo pidiera.

## Migration Plan

Sin migraciones. Rollback: revertir el PR.

## UI Mockups

- Decision: no (no UI) — 2026-11-24. Change solo de backend; la acción de marcar asistencia en la pantalla corresponde a C-17 (`ui-gestion-turnos`).
