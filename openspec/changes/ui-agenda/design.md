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

### D10 — Ajustes a la maqueta aprobada (apply, 2026-11-24, decisión de Agus)
Al implementar se tomó la maqueta de Ludmi como referencia visual y se ajustó la spec donde la maqueta definía algo distinto o donde chocaba con una regla del proyecto:
- **Se sigue la maqueta (y se actualizó la spec)**: navegación con flechas `‹`/`›` de nombre accesible "Día anterior"/"Día siguiente" o "Semana anterior"/"Semana siguiente" y campo "Fecha"; el período con el año y la cantidad de turnos activos ("· 2 turnos"); encabezados de día con dos dígitos ("Mié 02/12"); leyenda de estados; en la cuadrícula semanal los turnos compactos.
- **Se aparta de la maqueta**:
  - Los turnos compactos de la semana muestran además el estado en texto: la maqueta solo mostraba hora y apellido, y el estado dependía solo del color (va contra `brand.md`, "los estados se leen sin depender del color").
  - Colores sueltos de la maqueta (`#ffffff` en el botón primario, `#f1b7b1` y `#7a1a12` en el aviso de error) y medidas en `px` se reemplazan por tokens o por variables locales documentadas, como en C-14.
  - El rango horario de la línea de tiempo es el de la spec (08:00–20:00, extendido); la maqueta mostraba 09:00–16:30 como ejemplo.
  - El badge del carril angosto de cancelados en móvil dice "Tardía" (como la maqueta), pero su nombre accesible sigue diciendo "Cancelación tardía".
- **Queda para C-17**: botón "+ Nuevo turno", franjas "Horario libre", turnos como enlaces al detalle (chevron). En C-16 los turnos no son interactivos.
- **Queda fuera del change**: menú "Agenda / Prestaciones / Pacientes" y el nombre del usuario en la barra superior (son de `AppLayout`; las pantallas de C-15 todavía no existen).

### D11 — Estados sin captura en la maqueta (apply, 2026-11-24, decisión de Agus)
La maqueta no trae captura de estos estados; se resolvieron con el sistema de diseño y el estilo del resto de la maqueta:
- **Cargando**: el encabezado, la navegación y la leyenda quedan visibles; en lugar de los turnos, un bloque con fondo `--color-sunken`, borde `--color-line`, un indicador giratorio en `--color-brand-600` (se detiene con `prefers-reduced-motion`) y el texto "Cargando turnos…". La región lleva `aria-busy="true"`.
- **Semanal en móvil**: la maqueta ocultaba la semana y el selector en pantallas angostas; se mantiene el selector y la semana se muestra como lista por día (encabezado "Lun 30/11" y los turnos completos, igual que en la vista diaria pero sin posición), con "Hoy" destacado como en la cuadrícula y los cancelados de la semana al final. Los días sin turnos muestran "Sin turnos".
- **Día sin turnos**: el bloque punteado de la maqueta ("No hay turnos para este día" + "Cuando agendes uno, va a aparecer en esta línea de tiempo.") sin el botón "+ Nuevo turno" (C-17), arriba de la línea de tiempo vacía. Semana sin turnos: "No hay turnos esta semana" + "Cuando agendes uno, va a aparecer en esta semana."
- **Error al cargar**: el aviso de la maqueta con tokens (`--color-danger-100`/`--color-danger-700`), título "No pudimos cargar la agenda", "Tus turnos siguen guardados." más el mensaje del cliente de la API para ese error, y "Reintentar" como botón secundario debajo.
- La vista (diaria/semanal y cuadrícula/lista) se decide en JS con `matchMedia('(min-width: 900px)')` y no con CSS, para no duplicar los turnos en el DOM.

### UI Mockups
- Design system revision: 2
- Decision: yes (2026-11-24)
- Mockups: [mockups/](mockups/) — hecha por Ludmi: agenda semanal (escritorio) y diaria (móvil y escritorio), con cancelados en carril angosto (D6), vista por defecto según ancho (D2), hora actual y horario libre. Fuentes: `design-system/components.html` §Agenda diaria y §Estados del turno, `discovery/informe-competitivo.md` §D.3 y la spec `web-agenda`.
- Approval: approved (2026-11-23, by Ludmi; en el equipo cada integrante aprueba su propia parte)
- Preview: rendered (2026-11-23, Playwright, por Ludmi: `mockups/*-1440x900.png`, `mockups/*-390x844.png`)
- Visual verify: passed (2026-11-24, Playwright contra `npm run dev` con la API simulada y el reloj fijo en el martes 01/12 a las 11:22, los mismos datos ficticios de la maqueta: `mockups/verify/`, 10 capturas a 390x844 y 1440x900). Ver [evidencia.md](evidencia.md).
  - Diaria móvil, diaria escritorio y semanal escritorio coinciden con las capturas de la maqueta, salvo lo decidido en D10 (rango 08:00–20:00, sin "+ Nuevo turno" ni menú, estado en texto en la semana).
  - Mayor, corregida: en móvil la navegación se partía en tres filas y el badge de los turnos de 30 min quedaba cortado. Ahora `‹ Fecha › Hoy` va en una fila y el badge arriba a la derecha, como en la maqueta.
  - Menor, corregida: faltaba el rótulo "Ahora" de la línea de hora actual en escritorio; el turno de 20 min de la semana pisaba sus tres líneas (ahora va en una, con elipsis).
  - Menor, sin cambios: en la lista semanal móvil, el chip de un cancelado con nombre largo parte la fecha en dos líneas.
  - Estados sin maqueta (D11) revisados: semanal móvil, día vacío, cargando y error, en los dos tamaños. Consola: sin errores de la app (solo las fallas de red forzadas en el caso de error).

## Risks / Trade-offs

- [La maqueta llega con decisiones distintas a D2 o D6] → Son las únicas que tocan escenarios de la spec; se ajustan con `openspec-update-change` antes del apply, no durante.
- [Turnos superpuestos entre activos (datos previos a las restricciones)] → No deberían existir por las `EXCLUDE` de C-06/C-07; si aparecieran, el último dibujado tapa al anterior. No se agrega lógica de columnas para un caso que la base impide.
- [Diferencia entre el reloj del navegador y el del servidor] → La línea de hora actual es solo orientativa; no se usa para decidir nada.
- [Semana con muchos turnos en móvil] → La lista por día crece en vertical; sin virtualización, aceptable para un consultorio de un sillón.

## Migration Plan

Sin migración de datos. Se retira `InicioPage` y el requisito provisorio de `web-app-shell` en el mismo PR. Rollback: revertir el PR.

## Open Questions

- ¿Se muestra "Horario libre" en las franjas vacías (está en `components.html`)? Se puede sumar en C-17 sin tocar esta spec.
