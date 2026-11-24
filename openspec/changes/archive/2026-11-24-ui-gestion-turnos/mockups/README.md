# Maquetas · Gestión de Turnos (C-17)

- **Design system revision:** 2
- **Approval:** approved (2026-11-23, by Ludmi)
- **Preview:** rendered (capturadas con Playwright en resoluciones desktop 1440x900 y mobile 390x844)
- **Fecha:** 2026-11-23

---

## Resumen y Alcance

Este change implementa las interfaces de usuario para la gestión de turnos del odontólogo: alta de turno, detalle, reprogramación, cancelación con aviso de cancelación tardía, registro de asistencia (atendido / ausente) y avisos de estado de la agenda.

### Decisiones de Alcance / Non-Goals
1. **Sin campo de notas / observaciones en alta y reprogramación**: `design.md` y `spec.md` establecen que las observaciones son un non-goal para esta versión de la UI (la API las acepta pero no son requeridas por la épica). El único campo de texto libre es "Motivo (opcional)" en la cancelación.
2. **Sin botón "guardar igual" ante solapamiento**: ante `409 TURNO_SOLAPADO`, la spec exige que el diálogo quede abierto con los datos cargados y el aviso correspondiente para que el usuario elija otro horario.

---

## Pantallas y Galerías de Estados

| Archivo HTML | Pantalla / Estados cubiertos | Captura Desktop (1440x900) | Captura Mobile (390x844) |
|---|---|---|---|
| `nuevo-turno.html` | Alta de turno, vacío, búsqueda de paciente (combobox D6), validación de campos, horario ocupado (409), estado guardando | `nuevo-turno-desktop-1440x900.png` | `nuevo-turno-mobile-390x844.png` |
| `detalle-turno.html` | Detalle del turno (programado, ya empezó, cancelado, cancelación tardía), acciones de asistencia y reprogramar/cancelar | `detalle-turno-desktop-1440x900.png` | `detalle-turno-mobile-390x844.png` |
| `reprogramar.html` | Reprogramación de turno, cálculo automático de hora fin, turno modificado (409) y horario ocupado (409) | `reprogramar-desktop-1440x900.png` | `reprogramar-mobile-390x844.png` |
| `cancelar.html` | Cancelación de turno, aviso de cancelación tardía (RN-CA-04), motivo opcional (máx. 255 chars), transición inválida (409) | `cancelar-desktop-1440x900.png` | `cancelar-mobile-390x844.png` |
| `avisos.html` | Agenda con banner de éxito (turno creado, reprogramado, cancelado, marcado) y alertas de error (turno modificado, transición inválida) | `avisos-desktop-1440x900.png` | `avisos-mobile-390x844.png` |

---

## Mapeo Código Técnico → Mensaje de Usuario (Sin Códigos en Pantalla)

| Código API | Caso | Mensaje en UI |
|---|---|---|
| `TURNO_SOLAPADO` | Solapamiento de horario | "Ese horario ya está ocupado" + detalle del turno en conflicto + "Elegí otro horario." |
| `TURNO_EN_PASADO` | Turno en fecha/hora pasada | "No se pueden dar turnos en el pasado." (en campo Día) |
| `TURNO_MODIFICADO` | Concurrencia (optimistic lock) | "Este turno cambió mientras lo editabas. Actualizamos la agenda: revisalo y probá de nuevo." |
| `TRANSICION_INVALIDA` | Cambio de estado inválido | "Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda." |
| `PACIENTE_INACTIVO` | Paciente dado de baja | "Ese paciente está dado de baja. Elegí otro paciente." |
| `PRESTACION_INACTIVA` | Prestación inactiva | "Esa prestación no está disponible. Elegí otra prestación." |
| `VALIDACION_FALLIDA` | Error de validación | Mensaje específico por campo (ej. "Elegí un paciente", "Elegí una prestación", "La duración tiene que estar entre 5 y 480 minutos"). |

---

## Accesibilidad (a11y) y Patrones UI

- **Diálogos modales (`<dialog>` nativo + `showModal()`)**: trampa de foco, rol modal, cierre con `Escape` o botón "Cancelar", devolución de foco al elemento iniciador.
- **Combobox de paciente**: implementación accesible conforme al patrón WAI-ARIA (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `role="option"` con `aria-selected`).
- **Anuncios de estado y error**: uso de `role="status"` (`aria-live="polite"`) para éxitos (creación, reprogramación, asistencia) y `role="alert"` (`aria-live="assertive"`) para solapamientos y errores críticos.
- **Tipografía y Contraste**: uso estricto de variables del design system (`tokens.css`), fuentes tabulares (`tnum`) para horas y montos, y áreas táctiles mínimas de 44x44px.
