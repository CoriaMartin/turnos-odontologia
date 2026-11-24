# Design

## Context

Motivación y alcance: ver [proposal.md](proposal.md). Requisitos: [specs/web-gestion-turnos/spec.md](specs/web-gestion-turnos/spec.md).

Estado de lo que este change consume (al 2026-11-24, `main` en `42e3c3b`):

| Pieza | Change | En `main` | Contrato que se usa |
|---|---|---|---|
| Crear turno | C-07 | Sí | `POST /api/turnos` `{pacienteId, prestacionId, inicio, duracionMinutos?, observaciones?}` → 201 `TurnoResponse`. 409 `TURNO_SOLAPADO` con `turnoEnConflicto {id, inicio, fin}` (sin datos del paciente); 422 `TURNO_EN_PASADO`, `PACIENTE_INACTIVO`, `PRESTACION_INACTIVA`, `VALIDACION_FALLIDA`. |
| Reprogramar | C-10 | Sí | `PUT /api/turnos/{id}/reprogramacion` `{inicio, duracionMinutos?, version}` → 200. 409 `TURNO_SOLAPADO`, `TRANSICION_INVALIDA`, `TURNO_MODIFICADO`; 422 `TURNO_EN_PASADO`. |
| Agenda | C-08 | Sí | `GET /api/turnos?desde=&hasta=`; cada turno trae `version`. |
| Pacientes | C-06 | Sí | `GET /api/pacientes?q=&size=` → página `{contenido, …}` de activos. |
| Prestaciones | C-05 | Sí | `GET /api/prestaciones` → todas, con `activa`. |
| Pantalla de agenda | C-16 | **No** (propuesta en `agus/C-16-ui-agenda`, maqueta pendiente) | `AgendaPage`, vistas diaria/semanal, clave de consulta con prefijo `['turnos']` (D4 de C-16). |
| Cancelar | C-09 | **No** | Según `CHANGES.md`: `POST /api/turnos/{id}/cancelacion` con motivo opcional (≤ 255); resultado `CANCELADO` o `CANCELADO_TARDIO`; fuera de `PROGRAMADO` futuro → 409 `TRANSICION_INVALIDA`. |
| Asistencia | C-11 | **No** | Según `CHANGES.md`: `POST /api/turnos/{id}/asistencia` con `ATENDIDO` o `AUSENTE`; solo `PROGRAMADO` y hora ≥ inicio; otro caso → 409. |
| Configuración | C-12 | **No** (no figura como dependencia de C-17 en `CHANGES.md`) | `GET /api/configuracion` con las horas de cancelación tardía. |

`shared/api/mensajes.ts` ya prevé que "cada change agrega acá los códigos de su dominio (por ejemplo, `TURNO_SOLAPADO` en C-17)". El `onError` global de C-14 resuelve el 401 de las mutaciones.

## Goals / Non-Goals

**Goals:**
- Que las reglas de agenda las decida siempre el backend: la web app solo previene errores obvios (campos vacíos, inicio pasado, rango de duración) y explica los rechazos.
- Que los contratos no mergeados (C-09, C-11, C-12) queden aislados en un solo módulo para ajustar sin tocar componentes.

**Non-Goals:**
- Predecir solapamientos en el cliente: la fuente de verdad es la API (RN-AG-09).
- Alta de paciente desde el diálogo, arrastrar para reprogramar, deshacer.
- Ver o editar `observaciones` (la API las acepta, pero no las pide C-17).

## Decisions

### D1 — Rama desde `main`, no apilada sobre C-16
La spec de C-17 no modifica `web-agenda`: los puntos de entrada se describen en la capability nueva. Un delta `MODIFIED` sobre `web-agenda` ni siquiera se podría aplicar hasta que C-16 se archive. Apilar la rama sobre `agus/C-16-ui-agenda` arrastraría sus commits a este PR y obligaría a rebasear cada vez que C-16 cambie por la revisión de su maqueta (D2 y D6 de C-16 están abiertos). Antes del apply, la rama se rebasea sobre `main` con C-16 ya mergeado.

### D2 — Contratos de mutaciones en `features/agenda/turnosApi.ts`
Un módulo con `crearTurno`, `reprogramarTurno`, `cancelarTurno`, `registrarAsistencia` y `obtenerConfiguracion` sobre `apiFetch`, y hooks `useMutation` que en `onSuccess` y en `onError` con `TURNO_SOLAPADO`, `TRANSICION_INVALIDA` o `TURNO_MODIFICADO` invalidan `['turnos']` (la agenda de C-16 se vuelve a pedir).
- *Supuestos a confirmar contra C-09 y C-11 cuando se mergeen*: cancelación con cuerpo `{ "motivo": "..." }` (o sin cuerpo) que responde 200 con `TurnoResponse`; asistencia con cuerpo `{ "estado": "ATENDIDO" | "AUSENTE" }` que responde 200 con `TurnoResponse`; ninguna de las dos pide `version`. Si difieren, se ajusta este módulo y, si cambia algo visible, la spec con `openspec-update-change` antes del apply.
- *Alternativa*: llamar a `apiFetch` desde cada componente. Descartada: dispersa los supuestos y rompe la convención de C-14.

### D3 — Aviso de cancelación tardía con `GET /api/configuracion`
Las horas salen de `GET /api/configuracion` (C-12), consultada con `useQuery` (`staleTime` largo; cambia muy poco). El aviso se muestra si `inicio - ahora < horas` (estrictamente menor, RN-CA-04). Si la configuración no carga, se muestra el aviso genérico de la spec y se permite cancelar: el backend decide el estado y el anuncio final usa el estado devuelto.
- *Alternativa*: fijar 24 h en el cliente. Descartada: las horas son configurables (US-050) y el aviso mentiría tras un cambio.
- *Consecuencia*: C-12 pasa a ser dependencia práctica de C-17 (no figura en `CHANGES.md`). Se propone sumarla al roadmap; mientras tanto, el escenario "Configuración no disponible" cubre su ausencia.

### D4 — Inicio y hora de fin con las utilidades de fechas de C-16
`inicio` se arma como `AAAA-MM-DDTHH:MM:00-03:00` con el módulo `fechas.ts` de C-16 (zona del consultorio, offset fijo). "Termina HH:MM" se calcula en el cliente solo como ayuda; el `fin` real lo devuelve la API. Turnos que terminan después de la medianoche muestran "Termina 00:15 del día siguiente".

### D5 — Acciones por estado en una función pura
`accionesDisponibles(turno, ahora)` devuelve la lista según RN-ES-02/03 (programado y futuro → reprogramar/cancelar; programado y empezado → asistencia; final → ninguna). La usa el detalle y se testea sin render. Es una guía de UI: si el reloj del navegador difiere del servidor, la API responde `TRANSICION_INVALIDA` y se explica.

### D6 — Búsqueda de paciente con debounce y `size=10`
`useQuery(['pacientes', 'busqueda', q])` habilitada desde 2 caracteres, con 300 ms de debounce y `size=10`. El combobox sigue el patrón ARIA (`role="combobox"` + `listbox`). Las prestaciones se piden una vez (`['prestaciones']`) y se filtran por `activa`.

### D7 — Diálogos con `<dialog>` nativo
`showModal()` da foco atrapado, Escape y fondo inerte sin dependencias. Al cerrar se devuelve el foco al disparador. Los avisos de éxito van a una región `role="status"` de la agenda; los errores dentro del diálogo, con `role="alert"`.
- *Alternativa*: una librería de diálogos. Descartada: dependencia nueva para lo que el navegador ya resuelve.

### D8 — Textos y estilos
Los textos de la spec viven en `shared/api/mensajes.ts` (por código) o en los componentes (títulos). `TURNO_SOLAPADO` arma su texto con `turnoEnConflicto.inicio/fin`; como la API no trae el paciente en conflicto, el texto no lo nombra (difiere del ejemplo de `brand.md`, que sí lo hace). Estilos solo con `var(--…)`, partiendo de `components.html` §Formulario: nuevo turno y §Mensajes; los colores sueltos de `.alert-*` se reemplazan por tokens como en C-14.

### UI Mockups
- Design system revision: 2
- Decision: yes (2026-11-24)
- Mockups: `openspec/changes/ui-gestion-turnos/mockups/` (`gestion.css`, `nuevo-turno.html`, `detalle-turno.html`, `reprogramar.html`, `cancelar.html`, `avisos.html`).
- Approval: approved (2026-11-23, by Ludmi)
- Preview: rendered (`openspec/changes/ui-gestion-turnos/mockups/*-desktop-1440x900.png` y `*-mobile-390x844.png`)
- Visual verify: —

## Risks / Trade-offs

- [C-09 o C-11 se mergean con otro contrato] → Aislado en `turnosApi.ts` (D2); se revisa al rebasear antes del apply.
- [C-12 no llega antes que C-17] → Aviso genérico (escenario "Configuración no disponible"); el estado final lo decide el backend.
- [La maqueta de C-16 cambia la vista diaria y con ella las franjas libres] → El punto de entrada "franja libre" depende de la línea de tiempo de C-16; se ajusta junto con la aprobación de ambas maquetas.
- [Reloj del navegador adelantado o atrasado] → Las acciones visibles pueden no coincidir con lo que acepta el servidor; la API responde `TRANSICION_INVALIDA` o `TURNO_EN_PASADO` y la web app lo explica y refresca.

## Migration Plan

Sin migración de datos ni cambios de backend. Rollback: revertir el PR.

## Open Questions

- ¿Se suma C-12 como dependencia de C-17 en `CHANGES.md`? (D3; no cambia la spec porque el caso sin configuración ya está especificado.)
