# Proposal

## Why

El backend ya expone el catálogo de prestaciones (C-05) y la gestión de pacientes (C-06), y la web app ya tiene sesión (C-14) y agenda (C-16), pero el odontólogo no tiene dónde mantener sus prestaciones ni sus pacientes: las carpetas `frontend/src/features/prestaciones/` y `frontend/src/features/pacientes/` solo tienen un README. Sin esas pantallas no se cumplen US-010, US-020, US-021 ni US-022, y C-17 no puede abrir un "Nuevo turno" eligiendo paciente y prestación. La maqueta de C-15 ya fue aprobada, así que sólo faltan los artefactos OPSX para habilitar el apply.

## What Changes

- Dos rutas protegidas nuevas en la web app: `/prestaciones` y `/pacientes`, con enlaces "Prestaciones" y "Pacientes" en la barra superior junto a "Agenda" (la barra la define `AppLayout`; C-16 dejó ese menú pendiente para este change).
- Pantalla de prestaciones: listado de activas e inactivas con nombre, duración y estado, alta y edición en un diálogo, y activar/desactivar sin borrar (RN-PR-01, RN-PR-02). En móvil la tabla pasa a fichas apiladas, según la maqueta.
- Pantalla de pacientes: búsqueda por apellido, nombre o DNI con paginación, alta y edición con casilla de consentimiento para recordatorios (RN-RE-02), y baja lógica con confirmación (RN-PA-03, RN-PA-04).
- Errores del backend mostrados por campo y en avisos legibles, sin códigos técnicos: `NOMBRE_DUPLICADO`, `DNI_DUPLICADO`, `VALIDACION_FALLIDA` y `PACIENTE_CON_TURNOS_FUTUROS`. Los textos son los de la maqueta aprobada, en español rioplatense con "vos".
- Estados de carga, vacío y error con reintento en ambas pantallas, y el comportamiento de sesión vencida ya definido en `web-sesion` para un 401.
- Tests de formularios con validación, búsqueda, paginación, baja bloqueada y estados vacíos; verificación visual contra las cuatro capturas aprobadas de la maqueta.
- Fuera de alcance: crear, reprogramar o cancelar turnos y marcar asistencia (C-17); la agenda (C-16); la configuración de horas de recordatorio y cancelación tardía (C-18); envío real de emails; datos de pacientes reales en tests o capturas (RN-DS-01).

## Capabilities

### New Capabilities
- `web-administracion`: pantallas web de administración de prestaciones y pacientes: rutas y navegación, listados, formularios con errores por campo, consentimiento de recordatorios, baja lógica con confirmación y estados de carga/vacío/error.

### Modified Capabilities
- Ninguna. Los enlaces se agregan a `AppLayout` sin retirar ni cambiar requisitos de `web-app-shell`; los textos de nuevos códigos se suman al catálogo existente de `web-api-client`, que ya prevé ampliaciones por change.

## Impact

- **Frontend**: implementación en `frontend/src/features/prestaciones/` y `frontend/src/features/pacientes/` (tipos, API sobre `apiFetch`, hooks de TanStack Query, páginas, diálogos y CSS Modules con tokens). Se amplía `app/AppLayout.tsx` con la navegación y `app/router.tsx` con las dos rutas. Se suman mensajes en `shared/api/mensajes.ts`. Se actualizan los tests del layout y de rutas que hoy no contemplan estos enlaces.
- **API**: sólo consume los endpoints existentes de C-05 y C-06; no hay cambios de backend ni migraciones.
- **Dependencias**: ninguna nueva. React Router, TanStack Query y Testing Library ya están instalados.
- **Diseño**: maqueta aprobada en `mockups/` (revisión 2 del sistema de diseño), con capturas de 390x844 y 1440x900; no hace falta pedir otra aprobación antes del apply. Las diferencias admitidas respecto de `design-system/components.html` están en `design.md`.
- **Downstream**: C-17 consume las pantallas y los hooks de prestaciones y pacientes para el diálogo "Nuevo turno".
