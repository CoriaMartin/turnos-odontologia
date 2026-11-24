# Tasks

> **Bloqueo: no hay apply sin maqueta aprobada por el líder.** La maqueta está a cargo de Ludmi y todavía no existe (ver `design.md` → `### UI Mockups`). Antes de la tarea 1.1 tiene que estar en `mockups/` con su README en `Approval: approved (<fecha>, by líder)` y el mismo estado registrado en `design.md`. Criterio de aceptación visual: las capturas aprobadas de `mockups/previews/`.
>
> **Además, el apply necesita en `main`:** C-16 (`ui-agenda`), C-09 (`cancelar-turno`) y C-11 (`registrar-asistencia`). C-12 (`configuracion-consultorio`) es recomendable para el aviso de cancelación tardía (design D3).

## 0. Gates previos

- [ ] 0.1 Confirmar que la maqueta de Ludmi está aprobada por el líder: `mockups/README.md` y `design.md` con `Approval: approved` y capturas a 390x844 y 1440x900 de los estados listados en `design.md`; verificar leyendo ambos archivos antes de tocar código
- [ ] 0.2 Confirmar que C-16, C-09 y C-11 están mergeados (`git log origin/main`, `[x]` en `CHANGES.md`) y rebasear esta rama sobre `main`; verificar con `openspec validate ui-gestion-turnos --strict` en verde después del rebase
- [ ] 0.3 Contrastar los supuestos de D2 y D3 con las specs archivadas de C-09, C-11 y C-12 (cuerpos, respuestas, `version`); si algo visible cambia, actualizar spec y design con `openspec-update-change`; verificar dejando registrado en `design.md` "Contratos confirmados (<fecha>)"

## 1. Contratos y lógica pura

- [ ] 1.1 Crear `src/features/agenda/turnosApi.ts` con las funciones y hooks de D2 y sus invalidaciones de `['turnos']`; verificar con `turnosApi.test.ts` método, ruta y cuerpo de cada operación (incluidos `inicio` con `-03:00`, `version` en reprogramar y `estado` en asistencia) y que éxito y `TURNO_SOLAPADO`/`TRANSICION_INVALIDA`/`TURNO_MODIFICADO` invalidan la agenda
- [ ] 1.2 Crear `accionesDisponibles(turno, ahora)` (D5) y el cálculo de hora de fin y de cancelación tardía (D3, D4); verificar con tests unitarios "Turno programado futuro", "Turno programado que ya empezó", "Turno en estado final", "Aviso de cancelación tardía", "Justo en el límite" y fin después de medianoche
- [ ] 1.3 Sumar a `shared/api/mensajes.ts` los textos de `TURNO_EN_PASADO`, `PACIENTE_INACTIVO`, `PRESTACION_INACTIVA`, `TRANSICION_INVALIDA` y `TURNO_MODIFICADO`, y el armado del texto de `TURNO_SOLAPADO` con el horario en conflicto (D8); verificar con `mensajes.test.ts` los textos de la spec y que ninguno contiene el código

## 2. Nuevo turno

- [ ] 2.1 Crear el diálogo "Nuevo turno" con `<dialog>` (D7) según la maqueta aprobada, solo `var(--…)`; conectar "+ Turno" y la franja libre de la vista diaria de C-16; verificar "Desde el botón", "Desde una franja libre", "Franja pasada" y "Cerrar con Escape"
- [ ] 2.2 Combobox de paciente y selector de prestación con duración sugerida (D6); verificar "Elegir un paciente", "Menos de dos caracteres", "Sin coincidencias", "Duración sugerida y hora de fin", "Duración editada" y "Prestaciones inactivas ocultas"
- [ ] 2.3 Validación local y envío; verificar "Campos vacíos", "Día en el pasado", "Duración fuera de rango", "Creación exitosa", "Envío en curso", "Solapamiento al crear", "Turno en el pasado según el servidor", "Paciente dado de baja mientras se cargaba", "Error de validación por campo" y "Token rechazado al crear"

## 3. Detalle y acciones

- [ ] 3.1 Detalle de turno al activarlo en la agenda, con las acciones de `accionesDisponibles`, según la maqueta aprobada; verificar con render los tres escenarios de "Detalle de un turno y acciones según su estado"
- [ ] 3.2 Diálogo "Reprogramar"; verificar "Reprogramación exitosa", "El turno cambió mientras se editaba" y solapamiento al reprogramar (mismo aviso que al crear)
- [ ] 3.3 Confirmación de cancelación con motivo y aviso (D3); verificar "Aviso de cancelación tardía", "Justo en el límite", "Configuración no disponible", "Motivo demasiado largo", "Cancelación anticipada", "Cancelación tardía confirmada" y "El turno ya no se puede cancelar"
- [ ] 3.4 Acciones de asistencia; verificar "Marcar atendido" y "Asistencia rechazada"
- [ ] 3.5 Actualizar `src/features/agenda/README.md` con las operaciones, los contratos usados y el flujo de invalidación; verificar que menciona `turnosApi.ts`, la clave `['turnos']` y el aviso de cancelación tardía

## 4. Verificación integral

- [ ] 4.1 Correr `npm run verify` en `frontend/`; verificar todo en verde, `estilos.test.ts` incluido, y un test por cada escenario de `specs/web-gestion-turnos`
- [ ] 4.2 Prueba manual contra el backend local (`./mvnw spring-boot:run` + `npm run dev`): crear, solapamiento, reprogramar, cancelar anticipada y tardía, marcar atendido y ausente; registrar resultados en `evidencia.md`
- [ ] 4.3 Verificación visual: capturar cada estado de la maqueta a 390x844 y 1440x900 en `mockups/verify/`, comparar con la maqueta aprobada, revisar consola y red, y completar `Preview:` y `Visual verify:` en `design.md`

## Workflow follow-up

- Marcar `[x]` C-17 en `CHANGES.md` en el mismo PR que cierra el change.
- Archivar el change tras la revisión del PR.
