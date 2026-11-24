# Design

## Context

Motivación y alcance: ver [proposal.md](proposal.md). Requisitos: [specs/web-agenda/spec.md](specs/web-agenda/spec.md) y el delta de [specs/web-app-shell/spec.md](specs/web-app-shell/spec.md).

Lo que ya existe y condiciona el enfoque:

- **API (C-08)**: `GET /api/turnos?desde=&hasta=[&incluirCancelados=]` devuelve `TurnoResponse[]` ordenados por inicio: `id`, `inicio`, `fin` (ISO-8601 con zona, en `America/Argentina/Buenos_Aires`), `estado`, `duracion`, `version`, `paciente {id, nombre, apellido}`, `prestacion {id, nombre}`. Devuelve los turnos que se superponen con `[desde, hasta)`, exige zona horaria en los parámetros (RN-GL-01) y admite períodos de hasta 31 días. Por defecto incluye los cancelados.
- **Sesión (C-14)**: `crearQueryClient()` cierra la sesión como vencida ante un 401 en `QueryCache`/`MutationCache` y descarta la caché al cerrarse. La convención es que **toda llamada a la API pasa por TanStack Query**. `RutaProtegida` guarda `pathname + search` en `state.desde`, así que la fecha y la vista en la URL sobreviven a un nuevo login.
- **Cliente (C-02)**: `apiFetch` convierte cualquier falla en `ApiError`; `mensajeDeError` (en `shared/api/mensajes.ts`) da el texto sin códigos técnicos.
- **Layout (C-02)**: `AppLayout` ya usa el punto de quiebre de 900 px. `/` hoy renderiza `InicioPage` (provisoria).
- **Diseño**: `design-system/components.html` §Agenda diaria es la referencia (revisión 2 aprobada). Tiene dos puntos que no se pueden copiar tal cual: el turno cancelado ocupa el carril igual que un activo (US-031 pide que no ocupe el espacio) y los fondos de atendido/ausente usan hexadecimales sueltos (la regla dura exige `var(--…)`).

## Goals / Non-Goals

**Goals:**
- Una pantalla de agenda testeable sin backend, con la lógica de fechas y posiciones en funciones puras.
- Que C-17 pueda agregar acciones sobre un turno sin reescribir las vistas.

**Non-Goals:**
- Acciones sobre turnos, botón "+ Turno" o selección de franjas libres (C-17).
- Marcar "Horario libre" en la línea de tiempo (aparece en `components.html`, pero no lo pide US-031; queda para C-17 si la maqueta lo confirma).
- Prefetch del período anterior/siguiente, virtualización o modo sin conexión.

## Decisions

### D1 — La agenda reemplaza a `InicioPage` en `/`
`router.tsx` monta `AgendaPage` como ruta índice y se borra `InicioPage` con su CSS. El título de la página (`useTituloDePagina`) pasa a "Agenda".
- *Alternativa*: ruta `/agenda` y `/` redirige. Descartada: agrega una redirección sin beneficio en una app con una sola pantalla principal, y la spec `web-app-shell` ya preveía que `/` fuera la agenda.

### D2 — Fecha y vista como parámetros de búsqueda
`useSearchParams` lee `fecha` (`AAAA-MM-DD`) y `vista` (`dia|semana`). Navegar hace `setSearchParams` con push (no `replace`), para que Atrás funcione. Un valor inválido se ignora y se usa el defecto sin reescribir la URL. La vista por defecto, si no hay `vista`, sale de `matchMedia('(min-width: 900px)')` (semanal en escritorio, diaria en móvil) evaluado al montar.
- *Alternativa*: estado local de React. Descartada: se pierde al recargar, al volver tras una sesión vencida y no se puede compartir.
- *Supuesto*: "en móvil, vista diaria por defecto" (CHANGES.md) implica que en escritorio el defecto es la semanal. Se revisa al aprobar la maqueta; cambiarlo solo toca el escenario "Escritorio abre en la vista semanal".

### D3 — Fechas en la zona del consultorio con `Intl` y offset fijo `-03:00`
Un módulo puro `features/agenda/fechas.ts` trabaja con fechas civiles (`AAAA-MM-DD`) y calcula: hoy en `America/Argentina/Buenos_Aires` (`Intl.DateTimeFormat` con `timeZone`), lunes de la semana, sumar días, el par `desde`/`hasta` del período y los textos ("Miércoles 2 de diciembre", "Lun 30/11"). `desde`/`hasta` se arman como `AAAA-MM-DDT00:00:00-03:00`. Para ubicar un turno se usa la hora local que ya trae el ISO de la API (viene en la zona del consultorio), no la zona del navegador.
- *Alternativa*: sumar `date-fns-tz` o `Temporal`. Descartada: una dependencia nueva para una zona sin horario de verano desde 2009.
- *Riesgo aceptado*: si Argentina vuelve a adoptar horario de verano, el offset fijo queda mal. Está aislado en una constante de `fechas.ts`.

### D4 — Una consulta por período con TanStack Query
`features/agenda/api.ts` expone `consultarAgenda({desde, hasta}, signal)` sobre `apiFetch` y `useAgenda(periodo)` envuelve `useQuery` con la clave `['turnos', 'agenda', desde, hasta]`. El prefijo `['turnos']` permite que C-17 invalide toda la agenda tras crear o cancelar. `placeholderData: keepPreviousData` no se usa: al cambiar de período se muestra "Cargando turnos…" para no mezclar días. El 401 lo resuelve el `onError` global (sin manejo local); el aviso de error de la agenda se muestra solo si `error` no es un 401.
- *Alternativa*: pedir siempre la semana y filtrar el día en el cliente. Descartada por ahora: la spec fija el rango por vista y los tests de "rango pedido a la API" quedan más claros; si la maqueta pide cambiar de vista sin recarga se puede revisar.

### D5 — Posición en la línea de tiempo calculada en funciones puras
`features/agenda/lineaDeTiempo.ts` recibe los turnos de un día y devuelve el rango visible (08:00–20:00, extendido a franjas enteras de 30 min) y, para cada turno, `top`/`altura` en franjas (`minutos / 30`), que la vista multiplica por `var(--agenda-slot-height)` con `calc()`. Un turno que cruza la medianoche se recorta al día visible.

### D6 — Cancelados en un carril propio y angosto
Los activos ocupan el carril principal a todo el ancho. Los cancelados se dibujan en un carril lateral angosto a la derecha, con el rayado de `components.html`, horario y paciente tachados y el badge; así nunca tapan ni achican a un activo en el mismo horario (RN-AG-10) y no dependen solo del color. En la vista semanal se listan después de los activos del día, con el mismo tratamiento. La forma final la define la maqueta; la spec solo fija que no tapen ni desplacen a un activo.
- *Alternativa*: columnas lado a lado tipo calendario. Descartada: achica al turno activo, lo que la spec prohíbe.

### D7 — Hora actual con un reloj por minuto
`useAhora()` devuelve `Date` y se actualiza con un `setTimeout` alineado al próximo minuto. La línea se muestra solo si hoy está en el período y la hora cae en el rango visible. En tests se usa `vi.useFakeTimers()` + `vi.setSystemTime()`.

### D8 — Estilos solo con tokens
CSS Modules con `var(--…)`. Los fondos de atendido y ausente toman `--estado-atendido-bg` / `--estado-ausente-bg` en lugar de los hexadecimales de `components.html` (mismo criterio que C-14). `estilos.test.ts` ya verifica que no haya valores sueltos.

### D9 — Accesibilidad
Cada turno es un `article` (o `li` dentro de una lista por día) con `aria-label` "10:00 a 10:45, Paciente Ficticio Tres, Limpieza, Programado". La región de la agenda lleva `aria-busy` mientras carga; el error usa `role="alert"`; el selector Día/Semana usa botones con `aria-pressed`, como en `components.html`. La línea de hora actual es decorativa para el layout pero lleva `role="img"` con su nombre ("Hora actual: 10:18").

### UI Mockups
- Design system revision: 2
- Decision: yes (2026-11-24)
- Mockups: **pendiente: a cargo de Ludmi** (plan del equipo en CHANGES.md: "maqueta C-16", tanda 2). Al 2026-11-24 no existe en el repo, en ninguna rama remota ni en el historial. Fuentes que tiene que usar: `design-system/components.html` §Agenda diaria y §Estados del turno, `discovery/informe-competitivo.md` §D.3 (Codental: vistas día/semana; CareStack: densidad), y la spec `web-agenda` de este change. Puntos a resolver en la maqueta: carril de cancelados (D6), vista semanal en móvil, vista por defecto en escritorio (D2).
- Approval: pending (la aprueba el líder)
- Preview: —
- Visual verify: —

## Risks / Trade-offs

- [La maqueta llega con decisiones distintas a D2 o D6] → Son las únicas que tocan escenarios de la spec; se ajustan con `openspec-update-change` antes del apply, no durante.
- [Turnos superpuestos entre activos (datos previos a las restricciones)] → No deberían existir por las `EXCLUDE` de C-06/C-07; si aparecieran, el último dibujado tapa al anterior. No se agrega lógica de columnas para un caso que la base impide.
- [Diferencia entre el reloj del navegador y el del servidor] → La línea de hora actual es solo orientativa; no se usa para decidir nada.
- [Semana con muchos turnos en móvil] → La lista por día crece en vertical; sin virtualización, aceptable para un consultorio de un sillón.

## Migration Plan

Sin migración de datos. Se retira `InicioPage` y el requisito provisorio de `web-app-shell` en el mismo PR. Rollback: revertir el PR.

## Open Questions

- ¿Se muestra "Horario libre" en las franjas vacías (está en `components.html`)? Se puede sumar en C-17 sin tocar esta spec.
