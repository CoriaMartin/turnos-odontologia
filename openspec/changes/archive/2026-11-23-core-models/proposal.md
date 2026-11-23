# Proposal

## Why

Turnos, autenticación y recordatorios necesitan las entidades base del consultorio: el usuario que entra al sistema, el profesional y el sillón que ocupa cada turno, y los parámetros de configuración. C-03 es el segundo eslabón del camino crítico de [CHANGES.md](../../../CHANGES.md) y desbloquea C-04 (auth) y, a través de él, todo el backend.

## What Changes

- Migración `V2__core.sql` con las tablas `usuario`, `profesional`, `sillon` y `configuracion` (fila única), con `creado_en`/`actualizado_en`.
- Seed en la misma migración: el sillón "Sillón 1" y la fila de configuración por defecto (24 h de cancelación tardía, 24 h de anticipación de recordatorio, zona `America/Argentina/Buenos_Aires`). El usuario y el profesional **no** se siembran acá: los crea el bootstrap de C-04 desde variables de entorno.
- Entidades JPA y repositorios para las cuatro tablas, con auditoría de fechas basada en el reloj inyectable de C-01.
- Servicio que expone el profesional y el sillón únicos del consultorio (punto de extensión para multi-recurso, [DD-01](../../../knowledge-base/09_decisiones_y_supuestos.md)) y servicio de lectura de la configuración.
- **Convención nueva para todas las migraciones**: cadenas como `text` con `CHECK (length(col) <= n)` en lugar de `varchar(n)`. Se documenta en `knowledge-base/04_modelo_de_datos.md`.

Fuera de alcance: login, JWT y bootstrap del usuario (C-04); endpoints de configuración (C-12); pacientes, prestaciones y turnos.

## Capabilities

### New Capabilities
- `usuarios`: identidad de quien accede al sistema (email único sin distinguir mayúsculas, rol permitido, estado activo).
- `consultorio-recursos`: profesional y sillón que ocupa un turno, con el sillón inicial y el error cuando el consultorio no está configurado.
- `configuracion-consultorio`: parámetros únicos del consultorio, sus valores por defecto y sus límites válidos.

### Modified Capabilities
- Ninguna.

## Impact

- Código nuevo en `backend/src/main/java/ar/edu/turnosodonto/{auth,configuracion,shared}` y migración `V2__core.sql`.
- `knowledge-base/04_modelo_de_datos.md`: convención `text` + `CHECK` y tipos actualizados de estas cuatro tablas.
- Sin dependencias nuevas.
- C-05, C-06, C-07 y C-13 deben seguir la convención de tipos de texto.
