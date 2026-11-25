# Maqueta C-18 · UI Configuración de Recordatorios

Approval: approved (2026-11-24, by user)
Design system revision: 2
Preview: rendered (2026-11-24, Playwright, Chromium)

## Brief

- **Público y tarea**: el odontólogo configura las horas de cancelación tardía y recordatorio, y visualiza el estado de envío en el detalle del turno.
- **Pantallas**: 6 estados de la UI de configuración, cada una en un archivo HTML individual. Los datos son ficticios.
- **Tamaños**: 390x844 (móvil) y 1440x900 (escritorio).
- **Fuentes**: `design-system/tokens.css`, `brand.js` y `assets/logo.svg` (revisión 2). Componentes se toman de `components.html`.
- **Marca**: nombre "Agenda de Odontología" y logo definitivo.
- **Datos**: todos los nombres, DNI, horas y emails son ficticios.

## Pantallas

| Pantalla | HTML | Móvil (390x844) | Escritorio (1440x900) |
|---|---|---|---|
| Pantalla vacía | [configuracion-cargando.html](configuracion-cargando.html) | [configuracion-cargando-mobile-390x844.png](configuracion-cargando-mobile-390x844.png) | [configuracion-cargando-desktop-1440x900.png](configuracion-cargando-desktop-1440x900.png) |
| Formulario completo | [configuracion-completa.html](configuracion-completa.html) | [configuracion-completa-mobile-390x844.png](configuracion-completa-mobile-390x844.png) | [configuracion-completa-desktop-1440x900.png](configuracion-completa-desktop-1440x900.png) |
| Error: horas inválidas | [configuracion-error-validacion.html](configuracion-error-validacion.html) | [configuracion-error-validacion-mobile-390x844.png](configuracion-error-validacion-mobile-390x844.png) | [configuracion-error-validacion-desktop-1440x900.png](configuracion-error-validacion-desktop-1440x900.png) |
| Guardando configuración | [configuracion-guardando.html](configuracion-guardando.html) | [configuracion-guardando-mobile-390x844.png](configuracion-guardando-mobile-390x844.png) | [configuracion-guardando-desktop-1440x900.png](configuracion-guardando-desktop-1440x900.png) |
| Guardado exitoso | [configuracion-guardada.html](configuracion-guardada.html) | [configuracion-guardada-mobile-390x844.png](configuracion-guardada-mobile-390x844.png) | [configuracion-guardada-desktop-1440x900.png](configuracion-guardada-desktop-1440x900.png) |
| Detalle turno + recordatorio | [turno-detalle-recordatorio.html](turno-detalle-recordatorio.html) | [turno-detalle-recordatorio-mobile-390x844.png](turno-detalle-recordatorio-mobile-390x844.png) | [turno-detalle-recordatorio-desktop-1440x900.png](turno-detalle-recordatorio-desktop-1440x900.png) |

## Estados de error

La UI nunca muestra el código técnico: el mensaje es legible y el código queda solo en la API y en esta documentación.

| Código de la API | Campo | Mensaje en la maqueta |
|---|---|---|
| — | cancelacionTardia | "Debe ser ≥ 0" |
| — | recordatorio | "Debe ser > 0" |

## Cómo verla

Los HTML usan rutas relativas a `design-system/`. Abrilos con doble clic o, si el navegador bloquea archivos locales, serví el repo desde la raíz:

```
python -m http.server 8765 --bind 127.0.0.1
```

y abrí `http://127.0.0.1:8765/openspec/changes/ui-configuracion-recordatorios/mockups/configuracion-cargando.html` u otro de los archivos HTML.

## Accesibilidad

- `lang="es"` en el elemento `<html>`
- Enlace "Saltars al contenido" (siempre visible, salta al `<main>`)
- Cada sección tiene `data-estado` y `role="alert"` en mensajes de error/éxito
- Badges de estado usan `.badge` con colores semánticos (`--estado-programado-fg`, `--estado-atendido-fg`, `--estado-ausente-fg`, `--estado-cancelado-fg`, `--estado-tardio-fg`)
- Foco visible con `--focus-ring`
- Controles de al menos 44 px (`--hit-target`)
- `aria-label` en botones y navegación
- Diálogos e inputs con `aria-invalid` y `aria-describedby` cuando hay errores
- `data-brand-name` para inyección de marca vía `brand.js`