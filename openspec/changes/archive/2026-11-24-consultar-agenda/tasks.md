# Tasks — consultar-agenda (C-08)

Spec: `specs/turnos/spec.md`. Decisiones: `design.md` (D1–D5). Tests contra la base local `turnos_test`; la agenda no depende de la hora actual, así que los turnos se preparan por SQL sin reloj fijo.

## 1. Consulta por período (repositorio y servicio)

- [x] 1.1 Agregar `TurnoRepository.buscarAgenda(desde, hasta, estados)` con `join fetch` de paciente y prestación, condición `inicio < hasta and fin > desde`, `estado in :estados` y `order by inicio, id` (D1, D3); verificar con los tests de 2.2 a 2.6.
- [x] 1.2 Crear `PeriodoAgendaInvalidoException` (`NegocioException`, `VALIDACION_FALLIDA`, 422) cuyo `propiedades()` devuelva `errores` con `{campo, mensaje}` y mensajes en español rioplatense (D4); verificar que el cuerpo coincide con el de la validación de cuerpo en los tests de 3.x.
- [x] 1.3 Agregar `TurnoService.agenda(desde, hasta, incluirCancelados)` `@Transactional(readOnly = true)`: valida con el record `PeriodoAgenda` presencia, `hasta > desde` y período ≤ 31 días; arma los estados según `incluirCancelados` (D2); verificar con un test unitario de la validación (borde de 31 días exactos y 31 días + 1 minuto).

## 2. Endpoint y escenarios de listado

- [x] 2.1 Agregar `GET /api/turnos` en `TurnoController` con `desde`/`hasta` `OffsetDateTime` `@DateTimeFormat(iso = DATE_TIME)` opcionales e `incluirCancelados` (por defecto `true`), devolviendo `List<TurnoResponse>` (D5); verificar con `TurnoAgendaIT` en verde.
- [x] 2.2 Crear `TurnoAgendaIT` con el escenario "Turnos del período ordenados por inicio" (orden, solo el día pedido, resumen de paciente y prestación sin DNI); verificar que pasa.
- [x] 2.3 Test "Período sin turnos" → 200 con lista vacía.
- [x] 2.4 Tests de límites: empieza en el inicio (incluido), termina en el inicio (excluido), empieza en el fin (excluido), cruza el inicio del período (incluido).
- [x] 2.5 Tests de cancelados: incluidos por defecto con su estado; excluidos con `incluirCancelados=false` (los cancelados se preparan por SQL, como en `TurnoIT`).
- [x] 2.6 Test "Agenda sin token" → 401 `NO_AUTENTICADO`.

## 3. Escenarios de período inválido

- [x] 3.1 Tests: sin `desde` → 422 con `errores[].campo = desde`; `hasta` anterior a `desde` → 422 campo `hasta`; `desde` igual a `hasta` → 422 campo `hasta`.
- [x] 3.2 Tests: período de exactamente 31 días → 200; 31 días + 1 minuto → 422 campo `hasta`.
- [x] 3.3 Test "Fecha sin zona horaria" → 400 `SOLICITUD_INVALIDA` (confirma que no cae en el handler genérico de 500, ver Risks del design).

## 4. Verificación integral

- [x] 4.1 Correr `./mvnw verify` en `backend/` y verificar que queda en verde (tests nuevos + existentes de turnos, pacientes y auth).
- [x] 4.2 Revisar que cada escenario del spec delta tenga su test (tabla escenario → método en el resumen del PR).

## Workflow follow-up

- Sincronizar el spec delta en `openspec/specs/turnos/spec.md` y archivar el change tras la revisión.
- Marcar `[x]` C-08 en `CHANGES.md` en el mismo PR que cierra el change.
