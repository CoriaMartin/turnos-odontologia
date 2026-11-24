# Design — C-18 `ui-configuracion-recordatorios`

## Context

- Motivación y alcance: ver [proposal.md](proposal.md). Comportamiento: `GET /api/configuracion` devuelve `{ cancelacionTardia, recordatorio, zonaHoraria }` y `PUT /api/configuracion` actualiza esos campos (validación: cancelación ≥ 0, recordatorio > 0). C-12 ya expone los endpoints; C-13 reacciona a los cambios de configuración para ajustar la ventana de envío. C-02 deja los puntos de extensión `MENSAJES_POR_CODIGO` en `src/shared/api/mensajes.ts` y `configurarProveedorToken` en `src/shared/api/cliente.ts`. El router (`src/app/router.tsx`) tiene un layout con `/` y `*`, y la barra superior mostrá "Configuración" cuando hay sesión.

## Goals / Non-Goals

**Goals:**
- Una única fuente de verdad de la configuración, legible y modificable desde React, sin tocar el backend.
- Reacción ante errores de validación en un solo lugar, sin mostrar códigos técnicos al usuario.
- Pantalla de configuración accesible: etiquetas asociadas a los campos, errores al lado de cada campo, foco gestionado y objetivos táctiles de `--hit-target`.

**Non-Goals:**
- Enviar emails reales desde la pantalla (quedará apagado `MAIL_ENABLED=false`, KB DD-13).
- Cambiar el proveedor de email o el remitente (queda para un change posterior, KB DD-13).
- Mostrar datos clínicos ni de prestación en el formulario (solo horas numéricas).

## Decisions

### D1 — Store de configuración en un módulo, expuesto con `useSyncExternalStore`

`src/features/configuracion/store.ts` guarda `{ cancelacionTardia, recordatorio, zonaHoraria } | null` en una variable del módulo, más el motivo del último error (`'inválido' | 'guardando' | null`). Expone `cargarConfiguracion`, `guardarConfiguracion(motivo)`, `datosVálidos()` y el hook `useConfiguracion()`.

- **Por qué**: el formulario y el detalle del turno leen el mismo estado. `main.tsx` llama una vez a `configurarProveedorToken` y a `cargarConfiguracion` al iniciar.
- **Alternativa descartada**: un Context de React. Obliga a pasar el estado al formulario con un efecto y deja una ventana en la que el cliente no lo tiene.
- **Alternativa descartada**: `localStorage`. La consigna usa persistencia en backend y el estado debe sincronizarse con la base; un store de módulo es más seguro y fácil de reiniciar en tests.

### D2 — Validación al guardar

`guardarConfiguracion()` compara los nuevos valores con los actuales y solo envía `PUT` si cambiaron. Si la validación falla (cancelación < 0 o recordatorio ≤ 0), muestra un mensaje con el patrón `.field.invalid` + `aria-invalid` + `aria-describedby`; el foco va al primer campo inválido.

- **Alternativa descartada**: permitir valores nulos y tratarlos como por defecto. La regla de negocio (RN-CA-01) obliga a mayores o iguales a 0 para cancelación y mayores a 0 para recordatorio.

### D3 — Rutas: `/configuracion` bajo `RutaProtegida`

```
/                 → RutaProtegida → AppLayout → { index: InicioPage, *: NoEncontradaPage, configuracion: ConfiguracionPage }
```

`RutaProtegida` usa `useSesion()`; sin sesión devuelve `<Navigate to="/login" replace state={{ desde }} />`. `ConfiguracionPage` con sesión redirige a `state.desdi ?? '/'`; tras el login exitoso navega a `state.desde ?? '/configuracion'` con `replace`. El aviso "Tu sesión venció" se muestra si el último motivo de cierre es `'vencida'` y se consume al ingresar.

### D4 — Formulario y mensajes

- `<form noValidate>` con validación propia de campos vacíos (los globos nativos del navegador no respetan el tono de la marca). Errores con el patrón `.field.invalid` + `aria-invalid` + `aria-describedby`; el foco va al primer campo con error.
- `useMutation` para el guardado; `isPending` deshabilita el botón y muestra el spinner con `aria-busy`. Los campos pasan a `readOnly` mientras carga.
- Textos: `HORAS_INVALIDAS` y `GUARDAR_EXITOSO` se suman a `MENSAJES_POR_CODIGO` (convención de C-02). El título de cada aviso vive en `features/configuracion`. El `detail` del backend no se muestra: los textos los define la web app.
- Horas inválidas: se vacía el campo y se enfoca ese campo. El aviso usa `role="alert"`.

### D5 — Estilos solo con tokens

 `ConfiguracionPage.module.css` copia el patrón de tarjeta de `components.html` y el `.alert`. `components.html` define colores con tokens `--color-…`; la regla dura del proyecto prohíbe valores sueltos en el frontend, así que la implementación usa `--color-ink-900` (texto), `--color-primary-600` (fondo del formulario) y `--color-danger-100/700` (estados de error). El cambio visual es mínimo y queda a la vista en la maqueta.

## Risks / Trade-offs

- [Los valores se pierden si el backend reinicia] → Los valores quedan guardados en la base; la pantalla los vuelve a cargar al volver a entrar.
- [Un script inyectado (XSS) puede leer la memoria de la configuración] → Los datos son de solo configuración horaria, no sensibles como datos de salud; React escapa el contenido por defecto. No se usa `dangerouslySetInnerHTML`.
- [El usuario ingresa horas negativas por error] → La validación impede guardarlas y muestra el mensaje inmediato; el valor anterior se conserva.
- [El store de módulo filtra estado entre tests] → Reinicio en `afterEach` del setup.

## Migration Plan

Sin migraciones de datos. Rollback: revertir el PR; el backend no cambia.

## UI Mockups

- Design system revision: 2
- Decision: yes (2026-11-24). La maqueta la hace Ludmi, con el ok del equipo.
- Mockups: [mockups/](mockups/) — pantalla vacía, formulario completo, error de horas inválidas, guardando, guardado exitoso, inicio con sesión y "Configuración" en la barra. Fuentes: `design-system/components.html` §Configuración y §Mensajes, `design-system/brand.md` §Tono de los textos.
- Approval: pending (2026-11-24, por aprobar por el líder).
- Preview: manual (paths pendientes, se capturará con Playwright después de la aprobación).
- Visual verify: manual (checklist por pantalla después de la aprobación). Ver [evidencia.md](evidencia.md) cuando existan capturas.

## Migration Plan

Sin migraciones de datos. Rollback: revertir el PR; el backend no cambia.