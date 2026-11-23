# Design

## Context

C-01 dejó el proyecto Spring Boot con Flyway (`V1` = `btree_gist`), el `Clock` inyectable, `NegocioException` y el perfil de test contra `turnos_test`. El modelo de datos está en [knowledge-base/04](../../../knowledge-base/04_modelo_de_datos.md). Motivación en proposal.md; comportamiento en las specs `usuarios`, `consultorio-recursos` y `configuracion-consultorio`.

## Goals / Non-Goals

**Goals:**
- Que las invariantes de las specs las garantice la base de datos (`UNIQUE`, `CHECK`, `FK`), no solo el código.
- Dejar un único punto (`RecursosConsultorio`) desde donde la agenda obtiene profesional y sillón.

**Non-Goals:**
- Crear el usuario o el profesional (bootstrap de C-04).
- Endpoints REST (la configuración se expone en C-12).

## Decisions

### D1 — Tipos de texto: `text` + `CHECK (length(col) <= n)`
Elegida por el usuario. Mismo límite que `varchar(n)` pero ampliar un límite es cambiar el `CHECK`, sin `ALTER TYPE`. Hibernate valida `text` contra `String` con `@Column(columnDefinition = "text")`. Se documenta en KB 04 como convención para todas las migraciones.
- *Alternativa*: `varchar(n)` como decía la KB.

### D2 — Esquema `V2__core.sql`
- IDs `bigint generated always as identity` (en `configuracion`, `smallint` con `CHECK (id = 1)` y valor fijo 1 para garantizar la fila única).
- `usuario`: `email text not null check (length(email) <= 254)`, índice único sobre `lower(email)`; `password_hash text not null check (length <= 100)`; `rol text not null check (rol in ('ODONTOLOGO'))`; `activo boolean not null default true`.
- `profesional`: `usuario_id bigint not null unique references usuario(id) on delete restrict`; `nombre`, `apellido` `text not null` (≤ 100); `matricula text` (≤ 30).
- `sillon`: `nombre text not null unique` (≤ 50); `activo boolean not null default true`.
- `configuracion`: `horas_cancelacion_tardia int not null default 24 check (>= 0)`, `horas_anticipacion_recordatorio int not null default 24 check (> 0)`, `zona_horaria text not null default 'America/Argentina/Buenos_Aires' check (length <= 50)`.
- Todas con `creado_en timestamptz not null default now()` y `actualizado_en timestamptz not null default now()`.
- Seed en la misma migración: `insert into sillon(nombre) values ('Sillón 1')` e `insert into configuracion(id) values (1)`.
- *Alternativa*: seed desde código al arrancar. Descarta: la migración es reproducible y queda versionada.

### D3 — Auditoría de fechas con Spring Data JPA y el `Clock`
`EntidadAuditada` (`@MappedSuperclass`) con `@CreatedDate`/`@LastModifiedDate` sobre `Instant`. `@EnableJpaAuditing(dateTimeProviderRef = ...)` en una `@Configuration` dedicada (no en la clase principal, para no romper los slice tests) con un `DateTimeProvider` que lee del `Clock` de C-01. Así los tests con reloj fijo controlan también las fechas de auditoría.

### D4 — Entidades
- Paquetes: `Usuario` y `Rol` (enum) en `auth`; `Profesional`, `Sillon` y `RecursosConsultorio` en `agenda.recursos`; `Configuracion` y `ConfiguracionService` en `configuracion`.
- Entidades con constructor protegido para JPA y constructores/fábricas explícitas; sin setters genéricos. `Rol` se mapea con `@Enumerated(EnumType.STRING)`.
- `Configuracion` solo permite actualizar sus valores; su id es siempre 1.

### D5 — `RecursosConsultorio`
`recursos()` devuelve un record `Recursos(Profesional profesional, Sillon sillon)`: el único profesional y el primer sillón activo por id. Si falta alguno lanza `ConsultorioNoConfiguradoException` (subclase de `NegocioException`, código `CONSULTORIO_NO_CONFIGURADO`, HTTP 503: el servicio no puede operar hasta que se configure). Multi-profesional futuro: se reemplaza por una búsqueda por id sin tocar a los llamadores.

### D6 — Tests (perfil `test`, `turnos_test`)
- `@DataJpaTest` con `@AutoConfigureTestDatabase(replace = NONE)` contra PostgreSQL real y Flyway, para verificar las restricciones que pone la base. `@Import` de la configuración de auditoría y del `Clock`.
- Un test por escenario de las specs: seed de sillón y configuración, unicidad de email sin mayúsculas, rol inválido, email nulo, usuario activo por defecto, sillón duplicado, segundo profesional, límites de configuración, segunda configuración, y los tres casos de `RecursosConsultorio`.
- Las violaciones se verifican con `assertThatThrownBy(...).isInstanceOf(DataIntegrityViolationException.class)` tras `flush()`.

## Risks / Trade-offs

- [`@DataJpaTest` revierte cada test, pero el seed viene de la migración] → los tests que modifican el sillón seed o la configuración corren dentro de la transacción revertida; no contaminan otros tests.
- [Hibernate `validate` y `text`] → mapear con `columnDefinition = "text"` evita que exija `varchar`.
- [503 para consultorio no configurado puede confundirse con caída] → el `codigo` distingue el caso; en la práctica C-04 crea el profesional al arrancar.

## Migration Plan

Aplica `V2` sobre bases que ya tienen `V1`. Rollback: no hay datos de negocio todavía; revertir el PR y limpiar `turnos` con una base nueva.
