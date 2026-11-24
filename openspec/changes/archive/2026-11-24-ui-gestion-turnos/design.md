# Design

## Context

Motivación y alcance: ver [proposal.md](proposal.md). Requisitos: [specs/web-gestion-turnos/spec.md](specs/web-gestion-turnos/spec.md).

Estado de lo que este change consume (al 2026-11-24, `main` en `d3768a2`, rama rebaseada encima):

| Pieza | Change | En `main` | Contrato que se usa |
|---|---|---|---|
| Crear turno | C-07 | Sí | `POST /api/turnos` `{pacienteId, prestacionId, inicio, duracionMinutos?, observaciones?}` → 201 `TurnoResponse`. 409 `TURNO_SOLAPADO` con `turnoEnConflicto {id, inicio, fin}` (sin datos del paciente); 422 `TURNO_EN_PASADO`, `PACIENTE_INACTIVO`, `PRESTACION_INACTIVA`, `VALIDACION_FALLIDA`. |
| Reprogramar | C-10 | Sí | `PUT /api/turnos/{id}/reprogramacion` `{inicio, duracionMinutos?, version}` → 200. 409 `TURNO_SOLAPADO`, `TRANSICION_INVALIDA`, `TURNO_MODIFICADO`; 422 `TURNO_EN_PASADO`. |
| Agenda | C-08 | Sí | `GET /api/turnos?desde=&hasta=`; cada turno trae `version` y `duracionMinutos`; sin DNI del paciente. |
| Pacientes | C-06 | Sí | `GET /api/pacientes?q=&page=&size=` → página `{contenido, …}` de activos. |
| Prestaciones | C-05 | Sí | `GET /api/prestaciones` → todas, con `activa`. |
| Pantalla de agenda | C-16 | Sí (archivado `2026-11-24-ui-agenda`) | `AgendaPage`, vistas diaria/semanal, clave de consulta con prefijo `['turnos']` (D4 de C-16). |
| UI de pacientes y prestaciones | C-15 | Sí (PR #21) | Se reutilizan `buscarPacientes` (`features/pacientes/api.ts`), `usePrestaciones` (`features/prestaciones/hooks.ts`), los tipos `Paciente`/`Prestacion`, `formatearDni` y `useDialogo` (`shared/useDialogo.ts`). Ver D6 y D7. |
| Cancelar | C-09 | Sí (archivado `2026-11-24-cancelar-turno`) | Confirmado, ver "Contratos confirmados". |
| Asistencia | C-11 | Sí (archivado `2026-11-24-registrar-asistencia`) | Confirmado, ver "Contratos confirmados". |
| Configuración | C-12 | Sí, mergeado (PR #16) pero **sin archivar** ni `[x]` en `CHANGES.md` | Confirmado contra el código (`ConfiguracionController`, `ConfiguracionResponse`). |

`shared/api/mensajes.ts` ya prevé que "cada change agrega acá los códigos de su dominio (por ejemplo, `TURNO_SOLAPADO` en C-17)". El `onError` global de C-14 resuelve el 401 de las mutaciones.

### Contratos confirmados (2026-11-24)

Tarea 0.3: los supuestos de D2 y D3 coinciden con lo mergeado. **No cambia nada visible de la spec.**

| Supuesto | Fuente | Resultado |
|---|---|---|
| Cancelación con cuerpo `{ "motivo": "..." }` opcional, sin `version`, responde 200 con el turno | Spec archivada de C-09 (Requirement "Cancelar un turno") y `TurnoController.cancelar` (`@RequestBody(required = false)`) | Coincide. Motivo en blanco → `null`. `motivo` > 255 → 422 `VALIDACION_FALLIDA` con `motivo` en `errores` (la web app ya lo frena antes). |
| Resultado `CANCELADO` / `CANCELADO_TARDIO` según horas configuradas, límite exacto = `CANCELADO` | Spec de C-09 ("Cancelación anticipada o tardía") | Coincide con D3 (`<` estricto). |
| Fuera de `PROGRAMADO` futuro → 409 `TRANSICION_INVALIDA` | Spec de C-09 | Coincide. |
| Asistencia con cuerpo `{ "estado": "ATENDIDO" \| "AUSENTE" }`, sin `version`, 200 con el turno | Spec archivada de C-11 y `RegistrarAsistenciaRequest` | Coincide. Sin `estado` → 422; otro valor → 400 `SOLICITUD_INVALIDA` (la web app nunca los envía). |
| Asistencia solo `PROGRAMADO` con hora ≥ inicio; si no, 409 `TRANSICION_INVALIDA` | Spec de C-11 | Coincide con D5 (justo en el inicio ya ofrece asistencia). |
| `GET /api/configuracion` con las horas de cancelación tardía | `ConfiguracionController` / `ConfiguracionResponse` de C-12 | Coincide: `{horasCancelacionTardia, horasAnticipacionRecordatorio, zonaHoraria}`. |

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
Un módulo con `crearTurno`, `reprogramarTurno`, `cancelarTurno` y `registrarAsistencia` sobre `apiFetch` (`obtenerConfiguracion` quedó en `features/configuracion/api.ts`, donde C-18 la va a reutilizar para editar la configuración), y hooks `useMutation` que en `onSuccess` y en `onError` con `TURNO_SOLAPADO`, `TRANSICION_INVALIDA` o `TURNO_MODIFICADO` invalidan `['turnos']` (la agenda de C-16 se vuelve a pedir).
- `ApiError` (C-02) suma `propiedades` con el cuerpo completo del Problem Details, para leer `turnoEnConflicto` sin un caso especial en el cliente.
- *Supuestos (confirmados el 2026-11-24, ver "Contratos confirmados")*: cancelación con cuerpo `{ "motivo": "..." }` (o sin cuerpo) que responde 200 con `TurnoResponse`; asistencia con cuerpo `{ "estado": "ATENDIDO" | "AUSENTE" }` que responde 200 con `TurnoResponse`; ninguna de las dos pide `version`. Si difieren, se ajusta este módulo y, si cambia algo visible, la spec con `openspec-update-change` antes del apply.
- *Alternativa*: llamar a `apiFetch` desde cada componente. Descartada: dispersa los supuestos y rompe la convención de C-14.

### D3 — Aviso de cancelación tardía con `GET /api/configuracion`
Las horas salen de `GET /api/configuracion` (C-12), consultada con `useQuery` (`staleTime` largo; cambia muy poco). El aviso se muestra si `inicio - ahora < horas` (estrictamente menor, RN-CA-04). Si la configuración no carga, se muestra el aviso genérico de la spec y se permite cancelar: el backend decide el estado y el anuncio final usa el estado devuelto.
- *Alternativa*: fijar 24 h en el cliente. Descartada: las horas son configurables (US-050) y el aviso mentiría tras un cambio.
- *Consecuencia*: C-12 pasa a ser dependencia práctica de C-17 (no figura en `CHANGES.md`). Se propone sumarla al roadmap; mientras tanto, el escenario "Configuración no disponible" cubre su ausencia.

### D4 — Inicio y hora de fin con las utilidades de fechas de C-16
`inicio` se arma como `AAAA-MM-DDTHH:MM:00-03:00` con el módulo `fechas.ts` de C-16 (zona del consultorio, offset fijo). "Termina HH:MM" se calcula en el cliente solo como ayuda; el `fin` real lo devuelve la API. Turnos que terminan después de la medianoche muestran "Termina 00:15 del día siguiente".

### D5 — Acciones por estado en una función pura
`accionesDisponibles(turno, ahora)` devuelve la lista según RN-ES-02/03 (programado y futuro → reprogramar/cancelar; programado y empezado → asistencia; final → ninguna). La usa el detalle y se testea sin render. Es una guía de UI: si el reloj del navegador difiere del servidor, la API responde `TRANSICION_INVALIDA` y se explica.

### D6 — Búsqueda de paciente con debounce y `size=10`, reutilizando C-15
`useQuery(['pacientes', 'busqueda-turno', q])` habilitada desde 2 caracteres, con 300 ms de debounce, sobre `buscarPacientes({ q, pagina: 0, size: 10 })` de C-15. La clave cuelga del prefijo `['pacientes']` de C-15, así un alta, edición o baja de paciente también invalida esta búsqueda. El combobox sigue el patrón ARIA (`role="combobox"` + `listbox`) y muestra el DNI con `formatearDni` de C-15. Las prestaciones se piden con `usePrestaciones` de C-15 (clave `['prestaciones']`) y se filtran por `activa`.
- No se duplica ninguna función ni tipo de pacientes o prestaciones: C-17 solo importa de `features/pacientes` y `features/prestaciones`.

### D7 — Diálogos con `useDialogo` de C-15 (antes: `<dialog>` nativo)
C-15 dejó en `shared/useDialogo.ts` un hook de diálogo modal (`role="dialog"` + `aria-modal`, foco atrapado con Tab, Escape y foco de vuelta al disparador) que ya usan sus diálogos de pacientes y prestaciones. C-17 lo reutiliza en un componente `Dialogo` en vez de `<dialog>` + `showModal()`, para que toda la app se comporte igual y porque jsdom no implementa `showModal()`. `Dialogo` agrega el foco inicial en el primer campo o acción (`data-autofoco`), como pide la spec. Los avisos de éxito van a una región `role="status"` de la agenda que siempre existe; los errores dentro del diálogo, con `role="alert"`.
- *Alternativa*: `<dialog>` nativo (decisión original). Descartada al rebasear sobre C-15: serían dos implementaciones de diálogo modal en la misma app. El comportamiento de la spec ("Diálogos accesibles") no cambia.

### D8 — Textos y estilos
Los textos de la spec viven en `shared/api/mensajes.ts` (por código) o en los componentes (títulos). `TURNO_SOLAPADO` arma su texto con `turnoEnConflicto.inicio/fin`; como la API no trae el paciente en conflicto, el texto no lo nombra (difiere del ejemplo de `brand.md`, que sí lo hace). Estilos solo con `var(--…)`, partiendo de `components.html` §Formulario: nuevo turno y §Mensajes; los colores sueltos de `.alert-*` se reemplazan por tokens como en C-14.

### D9 — Puntos de entrada sin cambiar las vistas de C-16
Las vistas de C-16 reciben las acciones por un contexto (`AccionesAgendaContexto`); sin él, se ven como en C-16. Cada turno sigue siendo un `article` con su nombre accesible y suma un botón que lo cubre ("Ver turno: …"), así los tests y la semántica de C-16 no cambian. La vista diaria suma un botón por cada franja libre futura de 30 min ("Crear un turno el martes 1 de diciembre de 11:30 a 12:00"); se ve al pasar el puntero o al llegar con el teclado, para no llenar la línea de tiempo de recuadros.

### D10 — Diferencias con la maqueta aprobada
Se registran para la verificación visual (tarea 4.3):
- **DNI en el detalle y en la cancelación**: la maqueta lo muestra, pero `TurnoResponse` no trae el DNI del paciente ("sin DNI ni contacto"). No se muestra; pedir `GET /api/pacientes/{id}` por cada detalle no está en la spec. Sí se muestra en el combobox de "Nuevo turno", donde viene de la búsqueda.
- **`TURNO_MODIFICADO` al reprogramar**: `reprogramar.html` lo muestra dentro del diálogo; se implementa como en `avisos.html` (se cierra el diálogo y el aviso va a la agenda), porque el diálogo queda con una `version` vieja y un reintento fallaría de nuevo.
- **Avisos de `TRANSICION_INVALIDA` y `TURNO_MODIFICADO`**: la maqueta los parte en título + texto; se muestra la frase completa de la spec, sin título aparte.
- **Día y hora**: `<input type="date">` y `<input type="time">` nativos (como el selector de fecha de C-16) en vez de texto `dd/mm/aaaa`; el navegador los muestra en el formato local.
- **Franja libre**: visible al pasar el puntero o con foco (D9), no siempre recuadrada como en la maqueta.

### UI Mockups
- Design system revision: 2
- Decision: yes (2026-11-24)
- Mockups: `openspec/changes/archive/2026-11-24-ui-gestion-turnos/mockups/` (`gestion.css`, `nuevo-turno.html`, `detalle-turno.html`, `reprogramar.html`, `cancelar.html`, `avisos.html`).
- Approval: approved (2026-11-23, by Ludmi)
- Preview: rendered (2026-11-23, Playwright, por Ludmi: `mockups/*-desktop-1440x900.png` y `*-mobile-390x844.png`)
- Visual verify: passed (2026-11-24, Playwright contra `npm run dev` con la API simulada y el reloj fijo en el martes 01/12 a las 09:00 y a las 10:05, con los datos ficticios de la maqueta: `mockups/verify/`, 18 estados × 2 tamaños = 36 capturas). Consola sin errores propios (solo los 409/500 simulados) y sin solicitudes fallidas salvo las consultas que TanStack Query cancela al cambiar de día o cerrar un diálogo. Ver [evidencia.md](evidencia.md).
  - Coinciden con la maqueta: nuevo turno (vacío, búsqueda, errores, completo, horario ocupado, guardando), detalle (programado, ya empezó, cancelación tardía), reprogramar (y horario ocupado), cancelar (tardía, en el límite, sin configuración, motivo largo) y avisos (turno creado, marcado como atendido, transición inválida), salvo lo decidido en D10.
  - Mayor, corregida: al enviar, el navegador saca el foco del botón que se deshabilita; ante un rechazo el foco quedaba fuera del diálogo y Escape y Tab dejaban de funcionar (jsdom no lo reproduce). `Dialogo` ahora devuelve el foco al diálogo al terminar el envío. Test de regresión en "Diálogos accesibles".
  - Mayor, corregida: los errores de validación no se borraban al corregir el campo. Ahora cada cambio quita el error de ese campo. Test "al corregir un campo se quita su error".
  - Mayor, corregida: con la agenda desplazada (un turno de la tarde), el aviso de éxito o de error quedaba fuera de la vista o tapado por la barra sticky. Ahora se centra en la pantalla al aparecer.
  - Menor, corregida: el campo "Día" se estiraba cuando el campo vecino tenía más líneas, y quedaba visible la lista vacía del combobox (`display: grid` anulaba `hidden`). Las dos estaban también en la maqueta.
  - Menor, corregida: la nota del estado del turno ("El turno todavía no empezó…") usaba el tamaño de ayuda de campo; ahora va en tamaño de lectura como en la maqueta.

## Risks / Trade-offs

- [C-09 o C-11 se mergean con otro contrato] → Resuelto: confirmados el 2026-11-24 (ver "Contratos confirmados").
- [La configuración no carga] → Aviso genérico (escenario "Configuración no disponible"); el estado final lo decide el backend.
- [La maqueta de C-16 cambia la vista diaria y con ella las franjas libres] → El punto de entrada "franja libre" depende de la línea de tiempo de C-16; se ajusta junto con la aprobación de ambas maquetas.
- [Reloj del navegador adelantado o atrasado] → Las acciones visibles pueden no coincidir con lo que acepta el servidor; la API responde `TRANSICION_INVALIDA` o `TURNO_EN_PASADO` y la web app lo explica y refresca.

## Migration Plan

Sin migración de datos ni cambios de backend. Rollback: revertir el PR.

## Open Questions

- ¿Se suma C-12 como dependencia de C-17 en `CHANGES.md`? (D3; no cambia la spec porque el caso sin configuración ya está especificado.) C-12 ya está mergeado, pero falta archivarlo y marcarlo `[x]`: lo cierra su responsable.
