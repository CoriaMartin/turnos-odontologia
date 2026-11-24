# Design

## Context

C-07 dejó `Turno` (con columna `version` sin uso), `TurnoService.crear`, `ConsultaConflictos`, `BloqueoAgenda` (advisory locks por profesional y sillón) y las `EXCLUDE` de V5. Comportamiento en el delta de la spec `turnos`. Reglas RN-ES-03, RN-AG-01..06 y RN-RE-05 en [knowledge-base/05](../../../knowledge-base/05_reglas_de_negocio.md).

## Goals / Non-Goals

**Goals:**
- Reutilizar el mismo camino de validación que el alta (bloqueo, conflictos, traducción de `23P01`), excluyendo al propio turno.
- Detectar ediciones concurrentes con la `version` que el cliente leyó.

**Non-Goals:**
- Reaccionar al evento (C-13), cancelar o registrar asistencia.

## Decisions

### D1 — Transición en la entidad
`Turno.reprogramar(Intervalo nuevo, Instant ahora)`: exige `estado == PROGRAMADO` y `inicio` original posterior a `ahora`; si no, `TransicionInvalidaException` (409 `TRANSICION_INVALIDA`, pública en `agenda.turnos` para C-09/C-11). Cambia `inicio` y `fin`. El estado y las demás relaciones no se tocan.

### D2 — Bloqueo optimista con la version del cliente
- La solicitud trae `version` (obligatoria). El servicio compara contra `turno.getVersion()` antes de modificar; si difiere → `TurnoModificadoException` (409 `TURNO_MODIFICADO`).
- Además, `@Version` de JPA protege la carrera entre la comparación y el `UPDATE`: si Hibernate lanza `ObjectOptimisticLockingFailureException`, se traduce al mismo error.
- *Alternativa*: encabezado `If-Match` con ETag. Descarta: más maquinaria en el frontend para un solo usuario; un campo en el cuerpo es más simple de probar y de usar desde C-17.
- `TurnoResponse` suma `version`.

### D3 — Conflictos excluyendo al propio turno
`TurnoRepository.buscarQueSeSuperponen` suma el parámetro `excluirId` (`and t.id <> :excluirId`). El alta pasa `0` (los ids empiezan en 1). `ConsultaConflictos.buscar` y `buscarEnTransaccionNueva` reciben el id a excluir. Evita `:p is null`, que PostgreSQL no puede tipar.

### D4 — Flujo `TurnoService.reprogramar(id, NuevoHorario)`
1. Nuevo inicio no pasado → `TurnoEnPasadoException`.
2. Carga el turno (404) y compara `version`.
3. Duración: la informada o la actual (`fin - inicio`); valida 5–480.
4. `BloqueoAgenda.bloquear(profesional, sillón)` del turno (mismo orden que el alta: sin deadlocks entre altas y reprogramaciones).
5. `turno.reprogramar(intervalo, ahora)` → `TRANSICION_INVALIDA` si corresponde.
6. Busca conflictos excluyendo el propio id → `TURNO_SOLAPADO`.
7. `saveAndFlush`; traduce `23P01` (`TURNO_SOLAPADO`) y conflicto de `@Version` (`TURNO_MODIFICADO`).
8. Publica `TurnoReprogramado(turnoId, inicioAnterior, inicioNuevo)` con `ApplicationEventPublisher`.
- Orden 2 antes de 5: si la versión es vieja, el cliente debe refrescar antes de cualquier otra validación.
- *Ajuste de apply*: la transición se **valida** antes de buscar conflictos (`validarReprogramable`) y el turno se **modifica** después. Si se modificara antes, la consulta JPQL de conflictos haría *auto-flush* del `UPDATE` y la `EXCLUDE` saltaría dentro de la consulta, fuera del manejo de errores (500).

### D5 — Evento al confirmar
`TurnoReprogramado` es un `record` en `agenda.turnos`. Se publica dentro de la transacción; los consumidores (C-13) deben usar `@TransactionalEventListener(phase = AFTER_COMMIT)` para no actuar sobre una reprogramación revertida. Como el evento se publica después del `saveAndFlush` exitoso, un rechazo nunca lo publica.

### D6 — API
`PUT /api/turnos/{id}/reprogramacion` con `ReprogramarTurnoRequest(@NotNull OffsetDateTime inicio, @Min(5) @Max(480) Integer duracionMinutos, @NotNull Integer version)` → 200 `TurnoResponse`. Verbo `PUT` sobre el subrecurso, como define la KB (02 §API REST).

### D7 — Tests
- `TurnoReprogramacionIT` (`@SpringBootTest` + MockMvc + reloj mutable, `@RecordApplicationEvents`): un test por escenario del delta. Crea los turnos por la API (C-07) y el cancelado / el que ya empezó por JDBC. Limpia turnos antes y después.
- `TurnoIT` (C-07) suma la aserción de `version` en la consulta.
- Unitario `TurnoTest` para `reprogramar`: programado futuro ok; cancelado, atendido y ya iniciado → `TransicionInvalidaException`.

## Risks / Trade-offs

- [El cliente debe mandar `version`] → C-17 la toma del `GET`/listado; documentado en la respuesta.
- [Evento sin consumidor todavía] → aceptable; C-13 lo consume. Se prueba que se publique.

## Migration Plan

Sin migraciones. Rollback: revertir el PR.
