# Design

## Context

C-01 dejó el formato de errores (`NegocioException` → Problem Details con `codigo`), C-03 la auditoría y la convención `text` + `CHECK (length(...))`, C-04 la autenticación (todo `/api/**` exige token) y C-06 el patrón de módulo con DTOs, servicio `@Transactional` y tests de integración. Modelo en [knowledge-base/04 §prestacion](../../../knowledge-base/04_modelo_de_datos.md); reglas RN-PR y US-010 en [05](../../../knowledge-base/05_reglas_de_negocio.md) y [06](../../../knowledge-base/06_funcionalidades.md). No existe ninguna spec ni código previo de prestaciones salvo el `package-info.java`.

## Goals / Non-Goals

**Goals:**
- Que la base garantice el nombre único y el rango de duración, además de la validación de la API.
- Que desactivar una prestación conserve el registro y que cambiar su duración no altere turnos creados.
- Respuestas siempre con DTOs, con `codigo` de negocio en los errores y sin entidades JPA expuestas.

**Non-Goals:**
- Crear `turno`, su FK o el escenario ejecutable de RN-PR-02 (C-07).
- Paginación, búsqueda avanzada, categorías y pantalla de prestaciones (C-15).

## Decisions

### D1 — Esquema `V3__prestaciones.sql`
- Tabla `prestacion`: `nombre text NOT NULL CHECK (length(nombre) <= 100)`, `duracion_minutos integer NOT NULL CHECK (duracion_minutos BETWEEN 5 AND 480)`, `activa boolean NOT NULL DEFAULT true`, más `creado_en` y `actualizado_en timestamptz NOT NULL DEFAULT now()`. Unicidad con `CREATE UNIQUE INDEX prestacion_nombre_lower_uk ON prestacion (lower(nombre));`, igual que `usuario_email_lower_uk` en C-03.
- `id bigint GENERATED ALWAYS AS IDENTITY`, igual que V2 y V4.
- Seed de las 5 prestaciones de [knowledge-base/04 §Seed](../../../knowledge-base/04_modelo_de_datos.md) dentro de la migración; no se edita V1, V2 ni V4.

### D2 — Flyway fuera de orden
V3 mantiene su número fijo aunque se aplique después de V4. `spring.flyway.out-of-order: true` ya está en `application.yml` desde C-06, con comentario explícito sobre este caso, así que C-05 no modifica configuración. V3 solo crea la tabla `prestacion`, sin FK a otras tablas, por lo que el orden de aplicación no cambia el resultado.

### D3 — Capas del módulo `prestaciones`
- `Prestacion` extiende `EntidadAuditada`, con constructor `protected`, fábrica `nuevo(DatosPrestacion)`, `actualizar(DatosPrestacion)` y `desactivar()` / `activar()`; sin setters genéricos.
- `PrestacionRepository` extiende `JpaRepository`, con `findAllByOrderByNombreAsc()`, `existsByNombreIgnoreCase` y `existsByNombreIgnoreCaseAndIdNot` (Spring Data los traduce a `lower(nombre) = lower(?)`).
- `PrestacionService` (`@Transactional`): alta, edición, consulta, listado y cambio de `activa`. Verifica duplicado con `existsByNombreIgnoreCase` / `existsByNombreIgnoreCaseAndIdNot` antes de guardar y traduce la violación de `prestacion_nombre_lower_uk` a `NombreDuplicadoException` para cubrir la carrera entre dos altas.
- `PrestacionController` en `prestaciones.web` con records `PrestacionRequest` (Bean Validation: `@NotBlank`, `@Size(max=100)`, `@NotNull`, `@Min(5)`, `@Max(480)`) y `PrestacionResponse`. `POST` responde 201 con `Location: /api/prestaciones/{id}`.

### D4 — Unicidad y normalización
El nombre se recorta con `trim` en `DatosPrestacion.normalizados(...)`, como en `DatosPaciente`. La unicidad **no distingue mayúsculas y minúsculas**: decisión confirmada por el equipo. El índice único funcional `prestacion_nombre_lower_uk` sobre `lower(nombre)` es la garantía final en la base; el servicio usa `existsByNombreIgnoreCase` / `existsByNombreIgnoreCaseAndIdNot` y traduce la violación del índice a `NombreDuplicadoException`. Así "Limpieza" e "limpieza" se consideran el mismo nombre, tanto en alta como en edición.

### D5 — Activación y desactivación
`PATCH /api/prestaciones/{id}/activa` recibe `{ "activa": true|false }`, es idempotente y responde 200 con el DTO actualizado. No hay `DELETE` ni baja lógica similar a pacientes: el cambio de `activa` es reversible y se permite editar una prestación inactiva. `GET /api/prestaciones` devuelve activas e inactivas con el flag correspondiente, ordenadas por nombre, sin paginación; así C-15 puede reactivar sin un parámetro adicional. Decisión confirmada con el equipo: las inactivas se listan, se editan y se reactivan.

### D6 — Errores
`PrestacionNoEncontradoException` (404 `PRESTACION_NO_ENCONTRADA`) y `NombreDuplicadoException` (409 `NOMBRE_DUPLICADO`, código confirmado por el equipo, disparado por la violación de `prestacion_nombre_lower_uk`), ambas `NegocioException`. Nombre vacío, nombre > 100, duración nula o fuera de 5–480 los resuelve Bean Validation como 422 `VALIDACION_FALLIDA` con `errores[campo,mensaje]`. El `CHECK` de la base queda como segunda red; no se define un código de negocio adicional para la duración.

### D7 — Seed en la migración
Las 5 prestaciones se insertan en V3 porque son catálogo no sensible (SU-06, valores orientativos y editables). A diferencia del seed de pacientes de C-06, estarán en todos los entornos, incluido `turnos_test`: los tests no borran la tabla de forma global; crean sus propios registros con nombres con sufijo "Ficticia" y limpian solo esos ids, de modo que el seed sigue disponible para C-07.

### D8 — Tests
- `PrestacionIT` (`@SpringBootTest` + MockMvc, perfil `test`, token real del login): un test por escenario de la spec. Cada test crea sus propios registros con sufijo "Ficticia" y limpia solo esos ids; no hay `DELETE FROM prestacion` ni `deleteAll` globales. El escenario "Catálogo vacío" se ejecuta en un método `@Transactional` que revierte al finalizar, sin dejar la tabla vacía para otros tests.
- `PrestacionRepositoryIT` (`@PersistenciaTest`): `CHECK` de duración y el índice `prestacion_nombre_lower_uk` a nivel base, incluido el par "Limpieza Ficticia" / "limpieza ficticia", usando datos creados por el propio test; no afirma una cantidad exacta de filas del seed.
- Los tests no ejecutan SMTP ni usan la base `turnos`.

### D9 — Limitación de RN-PR-02 hasta C-07
"Cambiar la duración no modifica los turnos ya creados" no puede verificarse hoy: la tabla `turno` llega en V5 con C-07. En C-05 se registra como invariante de diseño: C-07 copiará `prestacion.duracion_minutos` al crear cada turno (`fin = inicio + duración`, RN-AG-05), de modo que ediciones posteriores del catálogo no reescriben turnos. El escenario de aceptación real se agregará a la spec de C-07, no se simula en C-05.

## Risks / Trade-offs

- [V3 se aplica después de V4] → mitigado por `out-of-order: true`; los tests con `clean()+migrate()` no ejercitan ese orden, así que se valida revisando la config y no renombrando la migración.
- [Seed presente en `turnos_test`] → los tests limpian la tabla y usan nombres propios; C-07 heredará esas 5 filas activas.
- [Índice funcional `lower(nombre)`] → sigue el precedente de `usuario_email_lower_uk` de C-03; `lower` es inmutable en PostgreSQL, por lo que el índice es válido y la búsqueda del servicio usa el mismo criterio que la base.
- [Primer endpoint PATCH del proyecto] → se define body explícito e idempotencia para evitar ambigüedad; el CORS ya permite PATCH.
- [`ddl-auto: validate`] → la entidad debe mapear `nombre` como `columnDefinition = "text"` y extender `EntidadAuditada`, o el contexto no arranca.

## Migration Plan

Aplica `V3` sobre bases en V2 o V4. Rollback: revertir el PR; la tabla `prestacion` es nueva y en `main` todavía no la referencia ninguna otra tabla.
