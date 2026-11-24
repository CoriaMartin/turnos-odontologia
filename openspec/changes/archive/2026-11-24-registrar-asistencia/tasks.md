# Tasks

> Governance MEDIO: checkpoint con el usuario al terminar cada grupo. Tests de integración contra `turnos_test` (sin H2 ni Testcontainers).

## 1. Dominio de la asistencia

- [x] 1.1 Agregar `EstadoAsistencia` (solo `ATENDIDO` y `AUSENTE`, con conversión a `EstadoTurno`) y `Turno.registrarAsistencia(estado, ahora)` con la guarda `PROGRAMADO` e `inicio <= ahora` (D1/D2); verificar con `TurnoTest`: marcado en el inicio, después del fin, rechazo con inicio futuro y desde `ATENDIDO`, `AUSENTE`, `CANCELADO` y `CANCELADO_TARDIO` sin modificar el turno

## 2. Servicio y API de asistencia

- [x] 2.1 Agregar `TurnoService.registrarAsistencia(id, estado)` según D3/D4 (reutilizar `buscarParaActualizar`, `Clock`, 404, traducción de `@Version` y log sin datos de paciente); verificar que compila y que los tests de C-07, C-08, C-09 y C-10 siguen en verde
- [x] 2.2 Crear `RegistrarAsistenciaRequest` (`@NotNull EstadoAsistencia`) y `POST /api/turnos/{id}/asistencia` (D1/D5); verificar con `TurnoAsistenciaIT` un test por escenario del delta de `turnos` (atendido a tiempo, ausente en el inicio, después del fin, sin `estado`, `PROGRAMADO` como estado, antes del inicio, doble marcado de `ATENDIDO` y de `AUSENTE`, cancelado, cancelado tardío, horario ocupado por atendido y por ausente, inexistente, sin token) y que `TurnoIT` sigue en verde sin cambios en `TurnoResponse`
- [x] 2.3 Test de dos marcados simultáneos del mismo turno (patrón de `TurnoConcurrenciaIT`); verificar que una respuesta es 200, la otra 409 `TRANSICION_INVALIDA` y que el estado guardado es el de la 200

## 3. Verificación integral

- [x] 3.1 Correr `./mvnw verify` completo en `backend/` y confirmar que pasa y que cada escenario del delta de `turnos` tiene su test (2026-11-24: `BUILD SUCCESS`, 80 unit tests y 197 IT; `TurnoAsistenciaIT` 19/19; log `%TEMP%\c11-verify-docker.log`)
- [x] 3.2 Prueba manual con el backend local: crear un turno, fijar el reloj o esperar al inicio, marcarlo con `curl` con `ATENDIDO` y `AUSENTE`, reintentar el marcado y ver el estado en `GET /api/turnos/{id}`; registrar los comandos y respuestas en `evidencia.md` (2026-11-24: turnos con inicio ya cumplido insertados por SQL porque DD-12 prohíbe el alta pasada por API; ver `evidencia.md`)

## Workflow follow-up

- Avisar a C-17 (`ui-gestion-turnos`) que el contrato quedó confirmado: cuerpo `{ "estado": "ATENDIDO" | "AUSENTE" }`, 200 con `TurnoResponse`, sin `version`, y 409 `TRANSICION_INVALIDA` en el reintento.
- Archivar el change (`openspec archive registrar-asistencia`) y sincronizar specs.
- Marcar `[x]` en C-11 de `CHANGES.md` en el mismo PR.
- Abrir PR `ludmi/C-11-registrar-asistencia` → `main`.
