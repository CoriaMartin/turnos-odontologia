# Tasks

## 1. Dominio y persistencia

- [x] 1.1 Crear `TransicionInvalidaException` y `Turno.reprogramar(intervalo, ahora)`; verificar con `TurnoTest` (programado futuro ok; cancelado, atendido y ya iniciado rechazados)
- [x] 1.2 Agregar `excluirId` a `TurnoRepository.buscarQueSeSuperponen` y a `ConsultaConflictos` (el alta pasa 0); verificar que los tests de C-07 siguen en verde

## 2. Servicio, evento y API

- [x] 2.1 Crear `TurnoModificadoException`, el evento `TurnoReprogramado` y `TurnoService.reprogramar` (version, duración, bloqueo, conflictos, traducción de `23P01` y de `@Version`, publicación del evento); verificar que compila
- [x] 2.2 Agregar `version` a `TurnoResponse` y `PUT /api/turnos/{id}/reprogramacion` con `ReprogramarTurnoRequest`; verificar con `TurnoReprogramacionIT` un test por escenario del delta (feliz, otra duración, datos obligatorios, solape, propio intervalo, adyacente, pasado, cancelado, ya iniciado, version desactualizada, evento publicado y no publicado, inexistente, sin token) y en `TurnoIT` la `version` en la consulta

## 3. Verificación integral

- [x] 3.1 Correr `./mvnw verify` completo y confirmar que pasan todos los tests y que cada escenario del delta tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive reprogramar-turno`) y sincronizar specs.
- Marcar `[x]` en C-10 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-10-reprogramar-turno` → `main`.
