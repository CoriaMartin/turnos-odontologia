# Sistema de diseño

Mode: system-and-mockups
Revision: 1
Approval: approved (2026-11-21, by user)
Decision source: plan de fundación aprobado por el usuario (2026-11-21), fase `visual-design`.

Base visual compartida de la web app (React + TypeScript). Cada change visual posterior crea su maqueta en `openspec/changes/<change>/mockups/` importando estos archivos, y se aprueba antes de implementarse.

## Archivos

| Archivo | Qué contiene |
|---|---|
| [tokens.css](tokens.css) | Colores, estados del turno, tipografía, espaciado, radios, sombras, foco y movimiento (con `prefers-reduced-motion`) |
| [brand.md](brand.md) | Nombre, tono visual, tono de textos, reglas de imágenes |
| [brand.js](brand.js) | Constante `BRAND_NAME` que completa los elementos `[data-brand-name]` |
| [components.html](components.html) | Componentes de referencia: botones, campos, estados, mensajes, agenda diaria, formulario de turno, pacientes, login |
| [assets/logo.svg](assets/logo.svg) | Logo **provisorio**, rotulado "TBD" |
| [previews/](previews/) | Capturas de página completa: `components-desktop-1440x900.png` (ventana 1440 de ancho) y `components-mobile-390x844.png` (columna de 390 px dentro de un marco neutro). Renderizadas con Edge headless el 2026-11-21 e inspeccionadas; en 375 px no hay desborde horizontal |

## Fuentes

- Público, tareas y reglas: [knowledge-base/](../knowledge-base/README.md) (01, 03, 05, 06).
- Patrones de referencia UX: [informe competitivo §D.3](../discovery/informe-competitivo.md) (CareStack, Codental, Dentally).
- Skill de criterio aplicada: `emil-design-eng` (feedback de presión en botones, curvas `ease-out`, movimiento reducido).

## Decisiones abiertas (TBD)

| Decisión | Estado | Dónde se reemplaza |
|---|---|---|
| Nombre del producto | (TBD) provisorio "Agenda Odonto (TBD)" | `brand.js` → `BRAND_NAME` |
| Logo | (TBD) placeholder rotulado | `assets/logo.svg` (mismo nombre de archivo) |
| Modo oscuro | (TBD) no incluido en la revisión 1 | `tokens.css` |
| Tipografía propia | (TBD) se usa la del sistema, sin fuentes remotas | `tokens.css` → `--font-sans` |

## Cómo reemplazar

1. **Nombre**: editar `BRAND_NAME` en `brand.js`. Todas las maquetas que usan `data-brand-name` se actualizan solas.
2. **Logo**: sobrescribir `assets/logo.svg` conservando el nombre. Quitar la etiqueta "Marca provisoria" de `components.html`.
3. **Colores o tipografía**: cambiar solo `tokens.css`, subir `Revision:` en este README, volver a `Approval: pending`, regenerar las capturas y revisar las maquetas afectadas.

## Uso en el frontend

`tokens.css` se importa una vez en `frontend/src/main.tsx`. Los componentes usan las variables CSS (`var(--color-brand-600)`), nunca valores sueltos.
