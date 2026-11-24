# Design

## Context

Motivación y alcance: [proposal.md](proposal.md). Requisitos: [specs/web-administracion/spec.md](specs/web-administracion/spec.md). Reglas: [knowledge-base/05](../../../knowledge-base/05_reglas_de_negocio.md) §RN-PA, §RN-PR, §RN-RE, §RN-DS; funcionalidades en [knowledge-base/06](../../../knowledge-base/06_funcionalidades.md) §Épica 2 y §Épica 3.

Lo que ya existe y condiciona el enfoque:

- **API (C-05, C-06, C-11)**: `GET /api/prestaciones` devuelve activas e inactivas ordenadas por nombre, sin paginación; `POST`, `PUT /{id}` y `PATCH /{id}/activa` con `{ "activa": boolean }` son idempotentes. `GET /api/pacientes?q=&page=&size=` devuelve `PaginaResponse` con `contenido`, `pagina`, `tamanio`, `totalElementos` y `totalPaginas` (tamaño 20 por defecto); `POST`, `PUT /{id}` y `DELETE /{id}` completan el CRUD. DNI con 7 u 8 dígitos sin puntos; nombre y apellido obligatorios; email opcional con formato válido; baja lógica con 409 `PACIENTE_CON_TURNOS_FUTUROS` si hay turnos `PROGRAMADO` futuros (RN-PA-04).
- **Contratos de error**: `apiFetch` entrega `ApiError` con `codigo`, `status` y `errores` por campo; `mensajeDeError` da el texto sin códigos. `crearQueryClient()` cierra la sesión como vencida ante un 401 en `QueryCache`/`MutationCache`; toda llamada a la API pasa por TanStack Query (convención de C-14, confirmada en C-16).
- **Layout (C-02, C-16)**: `AppLayout` tiene el enlace de salto, la marca, "Cerrar sesión" y el `<main id="contenido">`, con punto de quiebre de 900 px. `router.tsx` monta la agenda en `/`; no hay rutas para prestaciones ni pacientes. La carpeta de cada feature sólo tiene un README.
- **Diseño**: revisión 2 aprobada. `design-system/components.html` §Pacientes trae lista, buscador, estado vacío y casilla de consentimiento, pero su botón "Turno" no corresponde a este change (es C-17). La maqueta aprobada de C-15 es la referencia visual: dos pantallas, formularios con errores por campo y diálogo de baja. Tiene dos detalles que no se copian tal cual: los hexadecimales sueltos de `layout.css` (`#ffffff`, `#f1b7b1`, `#7a1a12`, `#921c13`, `#fff9f8`) y los números de ejemplo del contador de pacientes, que no coinciden con el `totalElementos` simulado; gana la regla de tokens y gana la API.

## Goals / Non-Goals

**Goals:**
- Que el odontólogo mantenga prestaciones y pacientes sin salir de la web app, con mensajes que digan qué pasó y qué hacer.
- Que los formularios y listados sean testeables sin backend y que C-17 pueda reutilizar los tipos, hooks y claves de caché.
- Que los datos personales se manejen con cuidado: nada de datos reales en tests, capturas ni ejemplos (RN-DS-01, RN-DS-03).

**Non-Goals:**
- Acciones sobre turnos, botón "Turno" en el listado de pacientes ni diálogo "Nuevo turno" (C-17).
- Configuración de horas (C-18), envío de emails y ficha clínica.
- Paginación del catálogo de prestaciones (la API no la ofrece) ni búsqueda avanzada.
- Optimismo en las mutaciones, sincronización offline ni nuevas dependencias.

## Decisions

### D1 — Una capability, dos rutas hijas del layout
Se agrega `web-administracion` como capability nueva, con `specs/web-administracion/spec.md`. Las páginas `PrestacionesPage` y `PacientesPage` viven en `features/prestaciones/` y `features/pacientes/` y se montan como rutas hijas de `AppLayout` en `router.tsx`: `/prestaciones` y `/pacientes`. `AppLayout` pasa a mostrar la navegación "Agenda / Prestaciones / Pacientes" con `NavLink` (que da `aria-current="page"`) en la barra superior; en móvil la nav baja a una segunda línea, como en la maqueta. No se retira ni se cambia ningún requisito de `web-app-shell`, así que no hay delta de esa capability; el menú es aditivo y lo pide C-15 desde C-16 (design D71 de ese change).

### D2 — Tipos, clientes y claves de caché por feature
Cada feature tiene `tipos.ts` y `api.ts`: funciones `listarPrestaciones`, `crearPrestacion`, `editarPrestacion`, `cambiarActiva` y `buscarPacientes`, `crearPaciente`, `editarPaciente`, `darDeBajaPaciente`, todas sobre `apiFetch`. Los hooks usan `useQuery`/`useMutation` con claves `['prestaciones']` y `['pacientes', q, pagina]`; toda mutación invalida esas claves al éxito. La desactivación de una prestación invalida también `['turnos']` para que C-17 no ofrezca al crear turno una prestación recién desactivada; la baja de un paciente invalida igual `['turnos']` porque RN-AG-08 exige paciente activo. El 401 lo resuelve el `onError` global: las pantallas no muestran su aviso de error cuando el fallo es de sesión.

### D3 — DNI: puntos para mostrar, dígitos para enviar
La API guarda el DNI como texto de 7 u 8 dígitos y no admite puntos (design D4 de C-06). Un helper puro `formatearDni` agrupa de derecha a izquierda en bloques de tres (`32112334` → `32.112.334`) para el listado; `soloDigitos` elimina puntos, espacios y guiones antes de `POST`/`PUT`. El campo del formulario admite la escritura con puntos y el error de DNI duplicado se asocia al campo, como en la maqueta.

### D4 — Formularios controlados y errores por campo
Un único componente de diálogo por feature (`FormularioPrestacion`, `FormularioPaciente`) con estado local para los campos, validación mínima en el cliente (obligatorios, rango 5–480, formato de DNI) y mapeo de `ApiError.errores` a cada control al responder la API. Cada control inválido lleva `aria-invalid="true"` y `aria-describedby` hacia el texto de error; el diálogo vuelve a abrirse con los valores escritos si falla. Los textos de `NOMBRE_DUPLICADO`, `DNI_DUPLICADO` y los errores de campo son los de la maqueta; `mensajeDeError` cubre el resto y el aviso general nunca muestra el código. El botón de guardar lleva `aria-busy` y spinner mientras muta, con el mismo patrón de `components.html`.

### D5 — Prestaciones: tabla en escritorio, fichas en móvil
Se mantiene una tabla semántica (`<th scope="col">`) en escritorio; por debajo de 900 px se apilan las filas como fichas con etiquetas `data-label`, sin duplicar el DOM ni ocultar acciones (misma técnica que la maqueta). El badge "Activa"/"Inactiva" usa los tokens de estado; la fila inactiva se atenúa con `--color-ink-500`. El cambio de estado usa `PATCH` y una mutación simple con invalidación (sin actualización optimista): si falla, la fila queda como estaba y aparece el aviso. No hay `DELETE` en la UI: desactivar es reversible (RN-PR-02).

### D6 — Pacientes: búsqueda en la URL y contador de la API
`q` y `page` se leen y escriben con `useSearchParams`; buscar hace push con `page=0`, y "Anterior"/"Siguiente" empujan la página nueva, para que Atrás funcione. El formulario de búsqueda se envía con Enter o con el botón "Buscar" (`role="search"`), sin debounce: el botón de la maqueta define ese momento. `size` es 20. El contador se deriva de `pagina`, `tamanio` y `totalElementos` ("Mostrando 1 a 4 de 45 pacientes"); el "N pacientes encontrados" de la maqueta se reserva para el texto del `role="status"` cuando hay `q`. La maqueta mostraba "4 pacientes encontrados" y "45 pacientes" a la vez: se descarta ese número de ejemplo y se usa la respuesta paginada, sin cambiar el diseño visual.

### D7 — Consentimiento visible en el listado
La casilla "Acepta recordatorios por email" se muestra en alta y edición con su ayuda; en alta arranca desmarcada (`aceptaRecordatorios` vale `false` si no se informa). En el listado, el badge distingue tres casos: con email y consentimiento → "Acepta recordatorios" (verde); con email sin consentimiento → "No acepta recordatorios" (neutro); sin email → "No recibe recordatorios" (aviso), porque RN-RE-02 exige ambos datos para enviar. El estado se lee sin depender del color (brand.md).

### D8 — Baja lógica y diálogo de confirmación
El diálogo de baja es estrecho, con título "¿Dar de baja a {Nombre y apellido}?", la advertencia de conservación y el pie con "Cancelar" y "Dar de baja" en rojo, según la maqueta. Al confirmar se envía `DELETE`; con 204 se cierra y se invalidan `['pacientes']` y `['turnos']`. Con 409 `PACIENTE_CON_TURNOS_FUTUROS` se muestra en un `role="alert"` el texto de la spec, que indica cancelar o reprogramar el turno (C-17) y no revela el código. El paciente dado de baja desaparece de las búsquedas porque la API filtra por `activo`.

### D9 — Estilos con tokens y responsive
CSS Modules por feature importando sólo `var(--…)` de `tokens.css`, con las mismas clases visuales de `layout.css` de la maqueta adaptadas al proyecto: tarjetas, tabla, fichas, buscador, paginación, diálogos, badges y alertas. Los hexadecimales de la maqueta se reemplazan por tokens (`--color-surface`, `--color-line`, `--color-danger-100`, `--color-danger-700`, `--color-brand-600`, etc.). `estilos.test.ts` se amplía para detectar valores sueltos, igual que en C-14/C-16. Números tabulares (`font-variant-numeric`) para DNI, duración y contadores.

### D10 — Accesibilidad de los estados sin maqueta
La maqueta no trae capturas de "cargando" ni "error"; se resuelven con los bloques de `components.html`: fondo `--color-sunken`, spinner que respeta `prefers-reduced-motion`, `role="alert"` para fallos y botón "Reintentar". La región de cada listado lleva `aria-busy` mientras carga. Los diálogos cierran con Escape, devuelven el foco al botón que los abrió y atrapan el foco mientras están abiertos. El enlace de salto y el `<main id="contenido">` ya los da `AppLayout`; no se duplican.

### UI Mockups
- Design system revision: 2
- Decision: yes (2026-11-23)
- Mockups: [mockups/](mockups/) — aprobados por el usuario; `prestaciones.html` (listado, formulario con nombre duplicado) y `pacientes.html` (búsqueda, listado con badges, formulario con DNI duplicado y email inválido, confirmación de baja), con `layout.css` y capturas de 390x844 y 1440x900. Fuentes: `design-system/components.html` §Pacientes, §Campos, §Botones, §Alertas y §Diálogo; `tokens.css` y `brand.js`.
- Approval: approved (2026-11-23, by usuario), según `mockups/README.md`
- Preview: rendered (2026-11-23, Playwright, Chromium), según `mockups/README.md`
- Visual verify: differences (2026-11-24, con Playwright): sin bloqueantes ni diferencias mayores; minor: los contadores y filas visibles usan datos reales de la API y no los ejemplos de la maqueta (D6), y la comparación se hizo por DOM/estilos computados porque el modelo no puede interpretar píxeles (la revisión visual humana queda disponible en `mockups/verify/`). Consola: 2 errores 409 esperados por duplicados provocados para capturar los estados de error; requests `ERR_ABORTED` esperados por el doble montaje de React Query. Detalle en [evidencia.md](evidencia.md).

## Risks / Trade-offs

- [Nuevos códigos de error sin mensaje propio] → `mensajeDeError` cae al genérico; se agregan textos sólo para los códigos de la maqueta y `PACIENTE_CON_TURNOS_FUTUROS`, sin mostrar nunca el código.
- [El contador de la maqueta no coincide con la paginación] → se usa la respuesta de la API (D6); el cambio es de datos, no de maqueta visual.
- [Mutación simultánea desde otra pestaña] → sin canal de sincronización; la invalidación al enfocar la ventana resuelve el caso habitual sin agregar websockets.
- [Datos personales en capturas de verificación] → todos los pacientes de prueba son ficticios con emails `@example.com` y DNIs con ceros a la izquierda (RN-DS-01).
- [Reutilización de `['turnos']` con C-17] → la clave ya existe y se invalida desde aquí; C-17 no necesita conocer las pantallas de catálogos.

## Migration Plan

Sin migración de datos: no hay cambios de backend ni esquema. Se agregan rutas y archivos frontend y se amplía `AppLayout`; rollback: revertir el PR. La navegación apunta a rutas que empiezan a existir en el mismo PR, así que no queda un enlace roto entre changes.

## Open Questions

- Ninguna. El DNI con puntos se muestra pero se envía sin ellos (D3) según design D4 de C-06; el botón "Turno" de `components.html` queda para C-17.
