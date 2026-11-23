# Maqueta C-02 · Layout base

Approval: approved (2026-11-23, by líder; confirmado por Agus)
Design system revision: 2 (aprobada sobre la 1; la 2 solo cambia nombre y logo, y el líder la aprobó el 2026-11-23 sin volver a revisar las maquetas)
Preview: rendered (2026-11-23, Playwright, Chromium)

## Brief

- **Público y tarea**: el odontólogo abre la web app y tiene que reconocer el producto y saber dónde está. Todavía no hay pantallas de negocio.
- **Pantallas**: inicio provisorio (estado vacío hasta C-16) y página para rutas inexistentes. Las dos comparten la barra superior.
- **Tamaños**: 390x844 (móvil) y 1440x900 (escritorio).
- **Fuentes**: `design-system/tokens.css`, `brand.js` y `assets/logo.svg` (revisión 2). La barra superior, los botones y el estado vacío se copian de `components.html`.
- **Marca**: nombre "Agenda de Odontología", sin rótulo "Marca provisoria". Los HTML toman el nombre de `design-system/brand.js`, actualizado con aprobación del líder el 2026-11-23. El logo de `assets/logo.svg` ya no es provisorio: sin "TBD" ni borde punteado, la muela centrada (cambio autorizado por el líder el 2026-11-23). Alt del logo: "Agenda de Odontología". Capturas regeneradas el 2026-11-23 con el logo nuevo.
- **Fuera de esta maqueta**: botón de usuario y cerrar sesión (C-14) y menú de secciones (llega con cada pantalla).

## Pantallas

| Pantalla | HTML | Móvil | Escritorio |
|---|---|---|---|
| Inicio | [inicio.html](inicio.html) | [inicio-mobile-390x844.png](inicio-mobile-390x844.png) | [inicio-desktop-1440x900.png](inicio-desktop-1440x900.png) |
| Ruta inexistente | [no-encontrada.html](no-encontrada.html) | [no-encontrada-mobile-390x844.png](no-encontrada-mobile-390x844.png) | [no-encontrada-desktop-1440x900.png](no-encontrada-desktop-1440x900.png) |

Detalles de accesibilidad incluidos: `lang="es-AR"`, enlace "Saltar al contenido" (visible solo con foco de teclado), logo con texto alternativo, una sola región `main`, foco visible con `--focus-ring` y botones de 44 px de alto (`--hit-target`).

## Cómo verla

Los HTML usan rutas relativas a `design-system/`. Abrilos con doble clic o, si el navegador bloquea archivos locales, serví el repo desde la raíz:

```
python -m http.server 8765 --bind 127.0.0.1
```

y abrí `http://127.0.0.1:8765/openspec/changes/archive/2026-11-23-frontend-scaffolding/mockups/inicio.html`.
