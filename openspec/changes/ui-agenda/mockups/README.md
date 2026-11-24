# Maqueta C-16 · UI Agenda

Approval: approved (2026-11-23, by usuario)
Design system revision: 2
Preview: rendered (2026-11-23, Playwright, Chromium)

## Brief

- **Público y tarea**: el odontólogo abre la agenda para ver el día o la semana de un vistazo, reconocer el estado de cada turno y entrar al detalle o crear uno nuevo.
- **Pantallas**: agenda diaria (línea de tiempo con franjas de 30 minutos, hora actual, navegación de fecha y botón "Hoy") y agenda semanal. Por defecto se abre la **semanal en escritorio** y la **diaria en móvil** (breakpoint 900 px); la vista pedida por URL manda sobre ese valor por defecto. Cada turno es un acceso al detalle; el horario libre ofrece "+ Nuevo turno". Se incluyen además los estados de día sin turnos y de error de carga con "Reintentar".
- **Cancelados**: en la vista diaria viven en un **carril angosto a la derecha**, rayado, con horario y paciente tachados y su badge, para que no ocupen ni achiquen el carril de los turnos activos (RN-AG-10, US-031). En la vista semanal se listan **después de los activos de la semana**, con el mismo tratamiento.
- **Tamaños**: 390x844 (móvil) y 1440x900 (escritorio).
- **Fuentes**: `design-system/tokens.css`, `brand.js` y `assets/logo.svg` (revisión 2). Franjas, línea de hora actual, badges de estado y botones siguen `components.html`; la franja mide `--agenda-slot-height` (30 min).
- **Marca**: nombre "Agenda de Odontología" y logo definitivo.
- **Datos**: pacientes, prestaciones y horarios ficticios. Ningún texto muestra códigos técnicos: el error de carga se explica en lenguaje claro.
- **Fuera de esta maqueta**: el formulario de alta y las acciones de reprogramar, cancelar y marcar asistencia (C-17); los turnos son estáticos y el selector de fecha no cambia los datos.

## Pantallas

| Pantalla | HTML | Móvil | Escritorio |
|---|---|---|---|
| Agenda semanal (por defecto en escritorio) | [agenda.html](agenda.html) | — (en móvil se muestra la vista diaria) | [agenda-semanal-desktop-1440x900.png](agenda-semanal-desktop-1440x900.png) |
| Agenda diaria | [agenda.html?vista=dia](agenda.html?vista=dia) | [agenda-diaria-mobile-390x844.png](agenda-diaria-mobile-390x844.png) | [agenda-diaria-desktop-1440x900.png](agenda-diaria-desktop-1440x900.png) |

Detalles de accesibilidad incluidos: `lang="es-AR"`, enlace "Saltar al contenido" (visible solo con foco de teclado), logo con texto alternativo, una sola región `<main>` con `tabindex="-1"`, conmutador de vista con `aria-pressed`, cada turno es un enlace con `aria-label` completo (paciente, prestación, horario y estado), el carril de cancelados se anuncia como grupo rotulado "Cancelados", franjas horarias y líneas decorativas con `aria-hidden`, día de hoy identificado en la cabecera semanal, foco visible con `--focus-ring` y controles de al menos 44 px (`--hit-target`). El estado nunca depende solo del color: siempre hay badge y texto.

## Estados

| Estado | Cómo se ve | Mensaje |
|---|---|---|
| Día sin turnos | Bloque punteado con acción | "No hay turnos para este día. Cuando agendes uno, va a aparecer en esta línea de tiempo." |
| Error de carga | Alerta con botón "Reintentar" | "No pudimos cargar la agenda. Tus turnos siguen guardados. Revisá tu conexión e intentá de nuevo." |
| Cancelado / tardío (diaria) | Carril angosto rayado a la derecha, horario y paciente tachados | Badge "Cancelado" o "Cancelación tardía" |
| Cancelado / tardío (semanal) | Franjas rayadas listadas después de los activos de la semana | Badge "Cancelado" o "Cancelación tardía" |
| Horario libre | Franja punteada con "+ Nuevo turno" | — |

## Cómo verla

Los HTML usan rutas relativas a `design-system/`. Abrilos con doble clic o, si el navegador bloquea archivos locales, serví el repo desde la raíz:

```
python -m http.server 8765 --bind 127.0.0.1
```

y abrí `http://127.0.0.1:8765/openspec/changes/ui-agenda/mockups/agenda.html` (en escritorio abre la semana; agregá `?vista=dia` para forzar la diaria).
