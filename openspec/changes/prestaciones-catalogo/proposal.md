# Proposal

## Why

Para crear un turno (C-07) el odontólogo necesita elegir una prestación y su duración; hoy el paquete `prestaciones` solo contiene un `package-info.java`. C-05 crea ese catálogo, desbloquea C-07 y la pantalla de prestaciones (C-15), y completa la fase de catálogos junto con C-06.

## What Changes

- Migración `V3__prestaciones.sql`: tabla `prestacion` con `id bigint GENERATED ALWAYS AS IDENTITY`, `nombre text` no nulo de hasta 100 caracteres con índice único funcional `prestacion_nombre_lower_uk` sobre `lower(nombre)` (mismo patrón que `usuario_email_lower_uk` en C-03), `duracion_minutos integer` no nulo con `CHECK (duracion_minutos BETWEEN 5 AND 480)`, `activa boolean NOT NULL DEFAULT true` y columnas de auditoría.
- Seed de 5 prestaciones de ejemplo en la propia migración (catálogo no sensible): Consulta/control 30', Limpieza 45', Obturación 45', Extracción 45' y Tratamiento de conducto 90'.
- Endpoints autenticados bajo `/api/prestaciones`: `GET` listado (todas, activas e inactivas, ordenadas por nombre, sin paginación), `POST` alta, `PUT /{id}` edición y `PATCH /{id}/activa` con body explícito `{ "activa": boolean }`, idempotente, que responde 200 con el DTO. No se agrega `DELETE`.
- Validaciones RN-PR-01/02: nombre obligatorio, único sin distinguir mayúsculas y minúsculas y de hasta 100 caracteres (se recorta al guardar); duración entre 5 y 480 minutos. Una prestación usada en turnos se desactiva, no se borra. Cambiar su duración no modifica turnos ya creados: se documenta como invariante de diseño y su escenario ejecutable se traslada a C-07, cuando exista la tabla `turno`.
- Errores de negocio: `PRESTACION_NO_ENCONTRADA` (404), `NOMBRE_DUPLICADO` (409); nombre o duración inválidos responden 422 `VALIDACION_FALLIDA` con `errores` por campo. Las respuestas usan DTOs y `ProblemDetail` con `codigo`, sin exponer entidades JPA.
- Sin cambios en configuración: `spring.flyway.out-of-order: true` ya habilitado permite aplicar V3 después de V4 sin renumerar ni tocar migraciones aplicadas.

Fuera de alcance: crear la tabla `turno` o su FK a `prestacion` (C-07), el escenario de integración de RN-PR-02 sobre turnos existentes (C-07), la pantalla de prestaciones (C-15) y la paginación del listado.

## Capabilities

### New Capabilities
- `prestaciones`: alta, consulta, listado, edición y activación/desactivación del catálogo de prestaciones con su duración.

### Modified Capabilities
- Ninguna.

## Impact

- Código nuevo en `backend/src/main/java/ar/edu/turnosodonto/prestaciones` y migración `backend/src/main/resources/db/migration/V3__prestaciones.sql`.
- Sin dependencias nuevas y sin cambios en archivos compartidos de seguridad, errores o configuración.
- C-07 consumirá el catálogo para la FK `turno.prestacion_id` y la validación de prestación activa (RN-AG-08); C-15 consumirá estos endpoints.
- Las 5 filas del seed estarán presentes también en `turnos_test`; los tests usan nombres con sufijo "Ficticia" y limpian solo sus propios registros, sin borrar el catálogo compartido.
