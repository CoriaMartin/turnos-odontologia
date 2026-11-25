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

### D1 — Estado de configuración con TanStack Query (reemplaza `store.ts`)

`src/features/configuracion/api.ts` expone `CLAVE_CONFIGURACION`, `obtenerConfiguracion`, `guardarConfiguracion` y los hooks `useConfiguracion()` y `useGuardarConfiguracion()`. La caché de TanStack Query es la única fuente de verdad en memoria: `useGuardarConfiguracion` usa `setQueryData(CLAVE_CONFIGURACION, configuracion)` con la respuesta del `PUT`, sin un store de módulo. El proveedor de token de C-14 ya está conectado en `main.tsx` y en `renderConRutas`, así que `GET`/`PUT /api/configuracion` viajan con `Authorization: Bearer <token>`; sin sesión no se envía el header.

- **Por qué**: la web app ya usa TanStack Query para agenda, prestaciones y pacientes; reutilizar su caché evita duplicar estados de carga/error y hereda el manejo de 401 de C-14.
- **Alternativa descartada**: `store.ts` con `useSyncExternalStore` (D1 original). Requiere sincronizar a mano la caché, la sesión y los reintentos; fue reemplazado por `api.ts` + `validacion.ts` según la decisión final del change.
- **Alternativa descartada**: un Context de React. Obliga a pasar el estado al formulario con un efecto y deja una ventana en la que el cliente no lo tiene.
- **Alternativa descartada**: `localStorage`. La consigna usa persistencia en backend y el estado debe sincronizarse con la base; el token tampoco se persiste (C-14).

### D2 — Validación en `validacion.ts` y en el servidor

`src/features/configuracion/validacion.ts` define `CampoHoras`, `HorasFormulario`, `ErroresHoras`, `VALOR_POR_DEFECTO` (24/24), `aFormulario`, `validarHoras` y `aHorasConfiguracion`. `validarHoras` rechaza campos vacíos, no enteros, cancelación < 0 y recordatorio ≤ 0. `ConfiguracionPage` no llama al `PUT` cuando hay fallos: marca el campo con `aria-invalid`/`aria-describedby`, muestra el mensaje en español rioplatense y enfoca el primero. El backend vuelve a validar con `@Min`, y un `HORAS_INVALIDAS` inesperado se traduce con `MENSAJES_POR_CODIGO` sin exponer el código.

- **Alternativa descartada**: permitir valores nulos y tratarlos como por defecto. La regla de negocio (RN-CA-01) obliga a mayores o iguales a 0 para cancelación y mayores a 0 para recordatorio.
- **Alternativa descartada**: comparar con los valores actuales y omitir el `PUT` si no cambiaron. El formulario siempre confirma el guardado para que el usuario vea `GUARDAR_EXITOSO`; el servidor es la fuente de verdad.

### D3 — Rutas: `/configuracion` bajo `RutaProtegida`

```
/                 → RutaProtegida → AppLayout → { index: InicioPage, *: NoEncontradaPage, configuracion: ConfiguracionPage }
```

`RutaProtegida` usa `useSesion()`; sin sesión devuelve `<Navigate to="/login" replace state={{ desde }} />`. `ConfiguracionPage` ofrece el enlace "Volver a la agenda" hacia `state.desde ?? '/'` (no redirecciona automáticamente tras guardar, para que el aviso de éxito siga visible); tras el login exitoso navega a `state.desde ?? '/configuracion'` con `replace`. El aviso "Tu sesión venció" se muestra si el último motivo de cierre es `'vencida'` y se consume al ingresar.

### D4 — Formulario y mensajes

- `<form noValidate>` con validación propia de campos vacíos (los globos nativos del navegador no respetan el tono de la marca). Errores con el patrón `.field.invalid` + `aria-invalid` + `aria-describedby`; el foco va al primer campo con error.
- `useMutation` para el guardado; `isPending` deshabilita el botón y muestra el spinner con `aria-busy`. Los campos pasan a `readOnly` mientras carga.
- Textos: `HORAS_INVALIDAS` y `GUARDAR_EXITOSO` se suman a `MENSAJES_POR_CODIGO` (convención de C-02). El título de cada aviso vive en `features/configuracion`. El `detail` del backend no se muestra: los textos los define la web app.
- Horas inválidas: se conserva lo escrito, se marca el campo y se enfoca el primero con error. El aviso usa `role="alert"`.

### D5 — Estilos solo con tokens

 `ConfiguracionPage.module.css` copia el patrón de tarjeta de `components.html` y el `.alert`. `components.html` define colores con tokens `--color-…`; la regla dura del proyecto prohíbe valores sueltos en el frontend, así que la implementación usa `--color-ink-900` (texto), `--color-primary-600` (fondo del formulario) y `--color-danger-100/700` (estados de error). El cambio visual es mínimo y queda a la vista en la maqueta.

## Risks / Trade-offs

- [Los valores se pierden si el backend reinicia] → Los valores quedan guardados en la base; la pantalla los vuelve a cargar al volver a entrar.
- [Un script inyectado (XSS) puede leer la memoria de la configuración] → Los datos son de solo configuración horaria, no sensibles como datos de salud; React escapa el contenido por defecto. No se usa `dangerouslySetInnerHTML`.
- [El usuario ingresa horas negativas por error] → La validación impede guardarlas y muestra el mensaje inmediato; el valor anterior se conserva.
- [La caché filtra estado entre tests] → `renderConRutas` crea un `QueryClient` nuevo por test y la caché se descarta al cerrar sesión (C-14).

## Migration Plan

Sin migraciones de datos. Rollback: revertir el PR; el backend no cambia.

## UI Mockups

- Design system revision: 2
- Decision: yes (2026-11-24). La maqueta la hace Ludmi, con el ok del equipo.
- Mockups: [mockups/](mockups/) — pantalla vacía, formulario completo, error de horas inválidas, guardando, guardado exitoso, inicio con sesión y "Configuración" en la barra, y detalle de turno con recordatorio. Las capturas aprobadas están directamente en `mockups/*.png`. Fuentes: `design-system/components.html` §Configuración y §Mensajes, `design-system/brand.md` §Tono de los textos.
- Approval: approved (2026-11-24, by user).
- Preview: rendered (2026-11-24, Playwright, Chromium; capturas aprobadas en `mockups/`).
- Visual verify: manual (2026-11-24). Se capturaron los estados en `mockups/verify/` y se compararon por DOM, texto, ARIA y tokens; la revisión pixel a pixel de las imágenes queda como checklist manual. Ver [evidencia.md](evidencia.md).

## Migration Plan

Sin migraciones de datos. Rollback: revertir el PR; el backend no cambia.