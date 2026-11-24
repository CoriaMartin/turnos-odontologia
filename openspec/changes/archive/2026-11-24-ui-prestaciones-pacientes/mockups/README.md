# Maqueta C-15 · UI Prestaciones y Pacientes

Approval: approved (2026-11-23, by usuario)
Design system revision: 2
Preview: rendered (2026-11-23, Playwright, Chromium)

## Brief

- **Público y tarea**: el odontólogo mantiene el catálogo de prestaciones (alta, edición, activar/desactivar, con duración en minutos) y administra sus pacientes (búsqueda por apellido, nombre o DNI, alta, edición con consentimiento de recordatorios y baja lógica).
- **Pantallas**: catálogo de prestaciones (`prestaciones.html`) y pacientes (`pacientes.html`). Cada HTML incluye además el formulario de alta/edición con errores de validación por campo y, en pacientes, el diálogo de confirmación de baja lógica.
- **Tamaños**: 390x844 (móvil) y 1440x900 (escritorio). En móvil la tabla de prestaciones pasa a fichas apiladas y la barra superior lleva la navegación a una segunda línea.
- **Fuentes**: `design-system/tokens.css`, `brand.js` y `assets/logo.svg` (revisión 2). Botones, campos, badges, alertas, lista y diálogo se toman de `components.html`.
- **Marca**: nombre "Agenda de Odontología" y logo definitivo.
- **Datos**: todos los nombres, DNI, obras sociales y emails son ficticios (`@example.com`).
- **Fuera de esta maqueta**: la agenda (C-16) y la gestión de turnos (C-17); los enlaces "Agenda" y los botones de acción son estáticos.

## Pantallas

| Pantalla | HTML | Móvil | Escritorio |
|---|---|---|---|
| Catálogo de prestaciones | [prestaciones.html](prestaciones.html) | [prestaciones-mobile-390x844.png](prestaciones-mobile-390x844.png) | [prestaciones-desktop-1440x900.png](prestaciones-desktop-1440x900.png) |
| Pacientes | [pacientes.html](pacientes.html) | [pacientes-mobile-390x844.png](pacientes-mobile-390x844.png) | [pacientes-desktop-1440x900.png](pacientes-desktop-1440x900.png) |

Detalles de accesibilidad incluidos: `lang="es-AR"`, enlace "Saltar al contenido" (visible solo con foco de teclado), logo con texto alternativo, una sola región `<main>` con `tabindex="-1"`, `role="search"` en el buscador, errores asociados con `aria-invalid="true"` y `aria-describedby`, diálogos con `role="dialog"` + `aria-labelledby` + `aria-describedby`, `aria-hidden` en avatares y separadores decorativos, foco visible con `--focus-ring` y controles de al menos 44 px (`--hit-target`).

## Estados de error

La UI nunca muestra el código técnico: el mensaje es legible y el código queda solo en la API y en esta documentación.

| Código de la API | Campo | Mensaje en la maqueta |
|---|---|---|
| `NOMBRE_DUPLICADO` | nombre | "Ya tenés una prestación con ese nombre. Probá con otro." |
| `VALIDACION_FALLIDA` | nombre / duracionMinutos | "Entre 5 y 480 minutos." (ayuda bajo el campo) |
| `DNI_DUPLICADO` | dni | "Ese DNI ya pertenece a otro paciente. Revisalo o buscá al paciente existente." |
| `VALIDACION_FALLIDA` | email | "Revisá el email: falta la parte después del arroba." |

## Cómo verla

Los HTML usan rutas relativas a `design-system/`. Abrilos con doble clic o, si el navegador bloquea archivos locales, serví el repo desde la raíz:

```
python -m http.server 8765 --bind 127.0.0.1
```

y abrí `http://127.0.0.1:8765/openspec/changes/ui-prestaciones-pacientes/mockups/prestaciones.html` o `http://127.0.0.1:8765/openspec/changes/ui-prestaciones-pacientes/mockups/pacientes.html`.
