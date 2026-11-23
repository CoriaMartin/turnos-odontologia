# Design

## Context

C-01 dejó el formato de errores (`NegocioException` → Problem Details), C-03 la auditoría de fechas y la convención `text` + `CHECK`, y C-04 la autenticación (todo `/api/**` exige token). Modelo en [knowledge-base/04 §paciente](../../../knowledge-base/04_modelo_de_datos.md); reglas RN-PA y RN-DS en [05](../../../knowledge-base/05_reglas_de_negocio.md). Comportamiento en la spec `pacientes`. Paginación y `out-of-order` son decisiones del usuario.

## Goals / Non-Goals

**Goals:**
- Que la unicidad del DNI y sus formatos los garantice la base, además de la validación en la API.
- Respuestas sin entidades JPA (DTOs) y sin datos personales en logs.

**Non-Goals:**
- RN-PA-04 (C-09), auditoría de cambios por campo, ficha clínica.

## Decisions

### D1 — Esquema `V4__pacientes.sql`
- `CREATE EXTENSION IF NOT EXISTS unaccent;` (extensión *trusted* desde PostgreSQL 13: la crea el dueño de la base, sin superusuario).
- Tabla `paciente`: `nombre`, `apellido` `text not null` (≤ 100); `dni text not null unique check (dni ~ '^[0-9]{7,8}$')`; `fecha_nacimiento date`; `telefono` (≤ 30), `email` (≤ 254), `obra_social` (≤ 100), `numero_afiliado` (≤ 50) `text` nulos; `acepta_recordatorios boolean not null default false`; `activo boolean not null default true`; auditoría.
- Índices: el `UNIQUE` de `dni`; `(activo, lower(apellido), lower(nombre))` para el listado ordenado.
- La búsqueda usa `lower(unaccent(col)) LIKE lower(unaccent(:q))` sin índice funcional: `unaccent()` no es `IMMUTABLE` y un consultorio independiente tiene pocos cientos de pacientes. Si creciera, se agrega un wrapper inmutable con índice trigram.

### D2 — Flyway fuera de orden
`spring.flyway.out-of-order: true` en `application.yml`. Los números de migración por change siguen fijos en CHANGES.md; esta opción solo permite aplicar una versión menor que llegue después (V3 de C-05 tras V4 de C-06). Las migraciones de distintos changes tocan tablas distintas, así que el orden de aplicación no cambia el resultado.

### D3 — Capas del módulo `pacientes`
- `Paciente` (entidad, extiende `EntidadAuditada`) con fábrica/`actualizar(DatosPaciente)` y `darDeBaja()`; sin setters genéricos.
- `PacienteRepository` con una consulta nativa paginada (`value` + `countQuery`) para la búsqueda con `unaccent`, y `existsByDni` / `existsByDniAndIdNot`.
- `PacienteService` (`@Transactional`): alta, edición, baja, búsqueda, obtener. Verifica DNI duplicado antes de guardar y además traduce la violación de `UNIQUE` (carrera entre dos altas) a `DniDuplicadoException`.
- `PacienteController` en `pacientes.web` con records `PacienteRequest` (Bean Validation: `@NotBlank`, `@Size`, `@Pattern("^[0-9]{7,8}$")`, `@Email`) y `PacienteResponse`; `PaginaResponse<T>` genérico en `shared.web` para reutilizar en otros listados.
- `POST` responde 201 con `Location: /api/pacientes/{id}`.
- `toString()` de request y entidad sin DNI, email ni teléfono, para que un log accidental no los exponga.

### D4 — Normalización de datos
Se recortan espacios en todos los textos; el email se guarda en minúsculas; textos opcionales vacíos se guardan como `null`. El DNI no admite puntos: el frontend (C-15) los quita antes de enviar.

### D5 — Errores
`PacienteNoEncontradoException` (404 `PACIENTE_NO_ENCONTRADO`), `DniDuplicadoException` (409 `DNI_DUPLICADO`), `PacienteInactivoException` (409 `PACIENTE_INACTIVO`), todas `NegocioException`.

### D6 — Paginación
`page` ≥ 0 (default 0), `size` entre 1 y 100 (default 20; valores mayores se recortan a 100, menores a 1 se llevan a 1). Orden fijo apellido, nombre, id.

### D7 — Seed `dev`
`PacientesDeEjemplo` (`ApplicationRunner`, `@Profile("dev")`): si no hay pacientes, crea 5 con nombres "Paciente Ficticio …", DNIs `0000000N` y emails `@example.com`. Nunca corre en `test` ni sin perfil.

### D8 — Tests
- `PacienteIT` (`@SpringBootTest` + MockMvc, perfil `test`, token real obtenido del login con las credenciales ficticias): un test por escenario de la spec, `OutputCaptureExtension` para el escenario de logs. Cada test usa DNIs propios y limpia `paciente` en `@BeforeEach` con `JdbcTemplate`.
- `PacienteRepositoryIT` (`@PersistenciaTest`): `CHECK` de DNI y `UNIQUE` a nivel base, búsqueda con tildes.

## Risks / Trade-offs

- [Búsqueda con `LIKE '%q%'` sin índice] → aceptable para el volumen de un consultorio independiente; documentado cómo escalar.
- [`out-of-order` oculta errores de numeración] → los números siguen asignados en CHANGES.md y se revisan en cada PR.
- [Un DNI de 7–8 dígitos puede coincidir con una persona real] → el seed y los tests usan DNIs con ceros a la izquierda (`0000000N`), que no se asignan en Argentina.

## Migration Plan

Aplica `V4` sobre bases en V2 (y V3 si C-05 ya está). Rollback: revertir el PR; la tabla `paciente` es nueva y no la referencia nada todavía.
