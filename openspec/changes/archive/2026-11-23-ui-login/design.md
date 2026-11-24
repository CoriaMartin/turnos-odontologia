# Design — C-14 `ui-login`

## Context

- Motivación y alcance: ver [proposal.md](proposal.md). Comportamiento: [specs/web-sesion](specs/web-sesion/spec.md) y [specs/web-app-shell](specs/web-app-shell/spec.md).
- C-02 dejó dos puntos de extensión: `configurarProveedorToken(() => string | null)` en `src/shared/api/cliente.ts` (el cliente agrega `Authorization: Bearer` si el proveedor devuelve un token) y `MENSAJES_POR_CODIGO` en `src/shared/api/mensajes.ts`. El router (`src/app/router.tsx`) tiene un único layout con `/` y `*`.
- C-04 expone `POST /api/auth/login` → 200 `{ token, tipo: "Bearer", expiraEn }` (ISO-8601, 8 h); 401 `CREDENCIALES_INVALIDAS`; 422 `VALIDACION_FALLIDA`; 429 `LOGIN_BLOQUEADO` (sin `Retry-After`, el bloqueo es siempre de 15 min, SU-05). Las rutas protegidas responden 401 `NO_AUTENTICADO`.
- Governance ALTO: el apply arranca solo con la maqueta aprobada por el líder.

## Goals / Non-Goals

**Goals:**
- Una única fuente de verdad de la sesión, legible desde React y desde el cliente HTTP, sin tocar `cliente.ts`.
- Reacción ante 401 en un solo lugar, sin que el 401 del propio login dispare "sesión vencida".
- Pantalla de login accesible: etiquetas, errores asociados a los campos, avisos anunciados, foco gestionado y objetivos táctiles de `--hit-target`.

**Non-Goals:**
- Refresh token, "recordarme" o sesión compartida entre pestañas (no hay en el MVP, KB 08 §Seguridad).
- Recuperar o cambiar la contraseña, nombre del usuario en la barra (el login no lo devuelve).
- Cuenta regresiva del bloqueo: el backend no informa el tiempo restante.

## Decisions

### D1 — Store de sesión en un módulo, expuesto con `useSyncExternalStore`
`src/features/auth/sesion.ts` guarda `{ token, expiraEn } | null` en una variable del módulo, más el motivo del último cierre (`'vencida' | 'manual' | null`). Expone `iniciarSesion`, `cerrarSesion(motivo)`, `tokenVigente()`, `suscribir` y el hook `useSesion()`.
- **Por qué**: el cliente HTTP (fuera de React) y los componentes leen el mismo estado. `main.tsx` llama una vez a `configurarProveedorToken(tokenVigente)`.
- **Alternativa descartada**: un Context de React. Obliga a pasar el token al cliente con un efecto y deja una ventana en la que el cliente no lo tiene.
- **Alternativa descartada**: `localStorage`/`sessionStorage`. Lo prohíbe la consigna (token solo en memoria) y lo expone a cualquier script inyectado de forma persistente.
- Los tests reinician el store en `src/test/setup.ts` (`afterEach`).

### D2 — Vencimiento comprobado al leer el token
`tokenVigente()` compara `expiraEn` con el reloj. Si ya venció, cierra la sesión con motivo `'vencida'` y devuelve `null`, así la solicitud sale sin `Authorization` y la ruta protegida redirige.
- **Alternativa descartada**: un temporizador hasta `expiraEn`. Agrega estado y limpieza para un caso que el chequeo al leer ya cubre; el usuario inactivo lo ve en su siguiente acción.

### D3 — 401 global en `QueryCache` y `MutationCache`
`crearQueryClient()` registra `onError` en ambas cachés: si el error es `ApiError` con `status === 401` **y hay sesión iniciada**, llama a `cerrarSesion('vencida')`. Además, el cliente se suscribe a la sesión y hace `clear()` cada vez que pasa de iniciada a cerrada, por cualquier motivo (401, token vencido detectado por `tokenVigente()` o cierre manual). Ajuste del apply: si `clear()` dependiera del 401, un token que vence antes de la solicitud cerraría la sesión sin limpiar la caché.
- **Por qué**: todas las llamadas a la API pasan por TanStack Query (convención de C-02). La condición "hay sesión" excluye el 401 `CREDENCIALES_INVALIDAS` del login, que corre sin sesión.
- **Alternativa descartada**: interceptar en `apiFetch`. Mezcla el cliente genérico con la sesión y obliga a modificar el contrato de `web-api-client`.

### D4 — Rutas: `/login` fuera del layout, el resto bajo `RutaProtegida`
```
/login            → LoginPage (sin barra superior)
/                 → RutaProtegida → AppLayout → { index: InicioPage, *: NoEncontradaPage }
```
`RutaProtegida` usa `useSesion()`; sin sesión devuelve `<Navigate to="/login" replace state={{ desde }} />`. `LoginPage` con sesión redirige a `/`; tras el login exitoso navega a `state.desde ?? '/'` con `replace`. El aviso "Tu sesión venció" se muestra si el último motivo de cierre es `'vencida'` y se consume al ingresar.

### D5 — Cierre de sesión en la barra
`AppLayout` suma un botón `btn-ghost` "Cerrar sesión" a la derecha (patrón de `components.html`, donde la barra ya muestra un botón fantasma a la derecha). Llama a `cerrarSesion('manual')`; la suscripción de D3 limpia la caché y `RutaProtegida` lleva a `/login`. Así no quedan datos de pacientes en la caché tras salir.

### D6 — Formulario y mensajes
- `<form noValidate>` con validación propia de campos vacíos (los globos nativos del navegador no respetan el tono de la marca). Errores con el patrón `.field.invalid` + `aria-invalid` + `aria-describedby`; el foco va al primer campo con error.
- `useMutation` para el login; `isPending` deshabilita el reenvío y muestra el spinner con `aria-busy`. Los campos pasan a `readOnly` mientras carga.
- Textos: `CREDENCIALES_INVALIDAS` y `LOGIN_BLOQUEADO` se suman a `MENSAJES_POR_CODIGO` (convención de C-02). El título de cada aviso vive en `features/auth`. El `detail` del backend no se muestra: los textos los define la web app.
- Credenciales inválidas: se vacía la contraseña y se enfoca ese campo. El aviso usa `role="alert"`.

### D7 — Estilos del login solo con tokens
`LoginPage.module.css` copia la tarjeta `.login` de `components.html` y el patrón `.alert`. `components.html` define `.alert-danger` con tres colores hexadecimales sueltos (`#f1b7b1`, `#7a1a12`); la regla dura del proyecto prohíbe valores sueltos en el frontend, así que la maqueta y la implementación usan `--color-danger-100` (fondo), `--color-danger-700` (borde e ícono) y `--color-ink-900` (texto). El cambio visual es mínimo y queda a la vista en la maqueta.

## Risks / Trade-offs

- [Recargar o abrir otra pestaña pide ingresar de nuevo] → Consecuencia aceptada del token en memoria; el mensaje del login no lo trata como error.
- [Un script inyectado (XSS) puede leer la memoria de la página] → El token no persiste fuera de la pestaña y vence en 8 h; React escapa el contenido por defecto. No se usa `dangerouslySetInnerHTML`.
- [Llamadas a la API fuera de TanStack Query no disparan el cierre por 401] → Convención documentada en `features/auth/README.md`; además `tokenVigente()` cubre el vencimiento.
- [El store de módulo filtra estado entre tests] → Reinicio en `afterEach` del setup.
- [El backend podría cambiar los 15 minutos del bloqueo] → El texto está en un solo lugar (`mensajes.ts`); si se vuelve configurable, se agrega `Retry-After` en otro change.

## Migration Plan

Sin migraciones de datos. Rollback: revertir el PR; el backend no cambia.

## UI Mockups

- Design system revision: 2
- Decision: yes (2026-11-23). La maqueta la hace Agus en lugar de Ludmi, con el ok del equipo.
- Mockups: [mockups/](mockups/) — login vacío, error de credenciales, bloqueo por intentos (429), cargando, campos incompletos, sesión vencida e inicio con "Cerrar sesión" en la barra. Fuentes: `design-system/components.html` §Inicio de sesión y §Mensajes, `design-system/brand.md` §Tono de los textos.
- Approval: approved (2026-11-23, by líder; incluye los avisos con colores de tokens en lugar de los hexadecimales de `components.html`, el aviso fijo de 15 minutos y los 3 estados extra)
- Preview: rendered (2026-11-23, Playwright: `mockups/previews/`, 390x844 y 1440x900)
- Visual verify: passed (2026-11-23, Playwright contra `npm run dev` con `/api/auth/login` simulado: `mockups/verify/`, los 7 estados a 390x844 y 1440x900). Sin diferencias bloqueantes. Ver [evidencia.md](evidencia.md).
  - Mayor, corregida: en el bloqueo (429) la app conservaba la contraseña y la maqueta la muestra vacía. Ahora se vacía (sumado al escenario "Login bloqueado" de la spec y a su test).
  - Menor, corregida: con foco, el campo inválido perdía el borde rojo; ahora lo conserva, igual que en `components.html`.
  - Menor, sin cambios: en "inicio con sesión", la caja vacía (fondo blanco y más alta) y los márgenes de escritorio vienen del layout de C-02, aprobado y verificado en su change; la maqueta de C-14 lo había copiado simplificado. La barra con "Cerrar sesión" coincide.
