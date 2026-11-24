# Proposal

## Why

Con C-16 el odontólogo puede ver su agenda, pero no puede hacer nada con ella: los turnos se crean, reprograman, cancelan y marcan solo por API. C-17 cierra el camino crítico del frontend (`… → C-16 → C-17 → C-20`) dándole desde la agenda las cuatro operaciones del día a día, con los errores de negocio explicados en su idioma.

## What Changes

- Diálogo "Nuevo turno" abierto desde el botón "+ Turno" de la agenda o desde una franja libre futura: búsqueda de paciente activo, prestación activa con duración sugerida y editable (5–480 min), día y hora, y la hora de fin calculada en vivo.
- Detalle de un turno al activarlo en la agenda, con las acciones que su estado permite (RN-ES-02, RN-ES-03):
  - **Reprogramar** (programado y futuro): nuevo día, hora y duración.
  - **Cancelar** (programado y futuro): motivo opcional y aviso previo cuando la cancelación va a ser tardía (RN-CA-01, RN-CA-04).
  - **Marcar atendido / ausente** (programado y ya empezado).
- Mensajes en español rioplatense, sin códigos técnicos, para `TURNO_SOLAPADO` (con el horario del turno en conflicto), `TURNO_EN_PASADO`, `TRANSICION_INVALIDA`, `TURNO_MODIFICADO`, `PACIENTE_INACTIVO` y `PRESTACION_INACTIVA`, y errores de validación por campo.
- Tras cada acción exitosa, o ante un error que indique que el turno cambió, la agenda se vuelve a pedir.
- Todas las llamadas pasan por TanStack Query (`useMutation`/`useQuery`), para que un 401 cierre la sesión como en C-14.
- Fuera de alcance: alta rápida de paciente desde el diálogo (la pantalla de pacientes es C-15), arrastrar y soltar para reprogramar, deshacer una cancelación, ver o editar observaciones.

## Capabilities

### New Capabilities
- `web-gestion-turnos`: operaciones sobre turnos desde la web app (crear, reprogramar, cancelar, registrar asistencia), qué acciones ofrece cada estado, los avisos y mensajes de error de esas operaciones y la actualización de la agenda después de cada una.

### Modified Capabilities
- (ninguna) La agenda (`web-agenda`, C-16) todavía no está archivada; C-17 no cambia sus requisitos: suma puntos de entrada ("+ Turno", franja libre, activar un turno) que se especifican en la capability nueva.

## Impact

- **Frontend**: `frontend/src/features/agenda/` (diálogos, detalle de turno, mutaciones), `shared/api/mensajes.ts` (textos de los códigos nuevos) y la página de agenda de C-16 (puntos de entrada).
- **API consumida**:
  - En `main`: `POST /api/turnos` (C-07), `PUT /api/turnos/{id}/reprogramacion` (C-10), `GET /api/pacientes?q=` (C-06), `GET /api/prestaciones` (C-05), `GET /api/turnos?desde=&hasta=` (C-08).
  - **No mergeados todavía**, contrato tomado de `CHANGES.md`: `POST /api/turnos/{id}/cancelacion` (C-09), `POST /api/turnos/{id}/asistencia` (C-11) y `GET /api/configuracion` (C-12, para las horas de cancelación tardía).
- **Dependencias**: ninguna nueva.
- **Diseño**: requiere maqueta aprobada por el líder antes del apply; la maqueta está a cargo de Ludmi y todavía no existe.
- **Orden de trabajo**: el apply necesita C-16, C-09 y C-11 en `main`; C-12 recomendado (ver `design.md`).
