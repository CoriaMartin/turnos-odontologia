# Design

## Context

Relevamiento en [explore.md](explore.md). Ya existen el profesional y el sillón únicos (`RecursosConsultorio`), los pacientes con baja lógica, el reloj inyectable, el formato de errores y la autenticación. Falta `prestacion` (C-05, Zaira): **apply espera su merge** y usa su entidad, repositorio y campos `duracionMinutos`/`activa` tal como los defina C-05. Comportamiento en la spec `turnos`. Decisiones de arquitectura base: [DD-03](../../../knowledge-base/09_decisiones_y_supuestos.md) (exclusión en PostgreSQL) y [DD-09](../../../knowledge-base/09_decisiones_y_supuestos.md) (sin sobreturnos, `[inicio, fin)`).

## Goals / Non-Goals

**Goals:**
- Garantía de no solapamiento en dos capas: dominio/servicio (mensaje claro con el turno en conflicto) y base de datos (correcta bajo concurrencia).
- Reglas de dominio testeables con JUnit puro, sin Spring ni base.

**Non-Goals:**
- Transiciones de estado (C-09..C-11), listados (C-08), sobreturnos.

## Decisions

### D1 — Esquema `V5__turnos.sql`
```sql
CREATE TABLE turno (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  paciente_id    bigint NOT NULL REFERENCES paciente (id),
  profesional_id bigint NOT NULL REFERENCES profesional (id),
  sillon_id      bigint NOT NULL REFERENCES sillon (id),
  prestacion_id  bigint NOT NULL REFERENCES prestacion (id),
  inicio timestamptz NOT NULL,
  fin    timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'PROGRAMADO'
         CHECK (estado IN ('PROGRAMADO','ATENDIDO','AUSENTE','CANCELADO','CANCELADO_TARDIO')),
  motivo_cancelacion text CHECK (length(motivo_cancelacion) <= 255),
  cancelado_en timestamptz,
  observaciones text CHECK (length(observaciones) <= 500),
  version integer NOT NULL DEFAULT 0,
  creado_en / actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT turno_intervalo_ck CHECK (fin > inicio),
  CONSTRAINT turno_sin_solape_profesional EXCLUDE USING gist
    (profesional_id WITH =, tstzrange(inicio, fin, '[)') WITH &&)
    WHERE (estado IN ('PROGRAMADO','ATENDIDO','AUSENTE')),
  CONSTRAINT turno_sin_solape_sillon EXCLUDE USING gist
    (sillon_id WITH =, tstzrange(inicio, fin, '[)') WITH &&)
    WHERE (estado IN ('PROGRAMADO','ATENDIDO','AUSENTE'))
);
CREATE INDEX turno_inicio_idx ON turno (inicio);
CREATE INDEX turno_paciente_idx ON turno (paciente_id, inicio);
CREATE INDEX turno_prestacion_idx ON turno (prestacion_id);
```
Índices de FK manuales (PostgreSQL no los crea); los de profesional y sillón los cubren los índices GiST de exclusión.

### D2 — Dominio puro en `agenda.dominio`
- `Intervalo(Instant inicio, Instant fin)`: valida `fin > inicio`; `seSuperponeCon(otro) = inicio < otro.fin && otro.inicio < fin` (semiabierto: el borde exacto no solapa); `de(inicio, duracion)`.
- `EstadoTurno` con `ocupaHorario()` = `PROGRAMADO | ATENDIDO | AUSENTE`.
- `ReglasAgenda` (funciones puras): `validarNoPasado(inicio, ahora)`, `validarDuracion(minutos)` (5–480) y `primerConflicto(nuevo, existentes)`.
- Tests JUnit sin Spring cubren todos los bordes de `Intervalo` y las reglas.

### D3 — Entidad y repositorio
- `Turno` (JPA, extiende `EntidadAuditada`) con `@ManyToOne(LAZY)` a `Paciente`, `Profesional`, `Sillon`, `Prestacion`; `inicio`/`fin` `Instant`; `estado` `@Enumerated(STRING)`; `@Version`. Fábrica `Turno.programar(paciente, recursos, prestacion, intervalo)`.
- `TurnoRepository.buscarActivosQueSeSuperponen(profesionalId, sillonId, inicio, fin)`: JPQL `t.estado in :activos and (t.profesional.id = :p or t.sillon.id = :s) and t.inicio < :fin and :inicio < t.fin`, ordenado por inicio, para informar el primer conflicto.

### D4 — `TurnoService.crear` (`@Transactional`)
1. `ReglasAgenda.validarNoPasado(inicio, clock.instant())` → `TurnoEnPasadoException`.
2. Paciente: `PacienteService.obtener` (404) y activo → si no, `PacienteInactivoParaTurnoException` (422 `PACIENTE_INACTIVO`). *Se reutiliza el código `PACIENTE_INACTIVO` de C-06 pero con 422*, porque acá es un dato inválido de la solicitud, no un conflicto de edición.
3. Prestación: existe (404 `PRESTACION_NO_ENCONTRADA`) y activa (422 `PRESTACION_INACTIVA`).
4. Duración: `duracionMinutos` de la solicitud o la de la prestación; `validarDuracion`.
5. `RecursosConsultorio.recursos()` → profesional y sillón.
6. Busca conflictos; si hay → `TurnoSolapadoException(conflicto)`.
7. `saveAndFlush`; si PostgreSQL rechaza con `SQLSTATE 23P01` (exclusion_violation, otra transacción ganó la carrera) → busca el conflicto en una transacción nueva y lanza `TurnoSolapadoException`.
- Orden de validaciones: primero lo barato y propio de la solicitud, después lo que depende de otros turnos.

### D4 bis — Bloqueo por recurso antes de verificar (ajuste de apply, 2026-11-23)
**Hallazgo**: `TurnoConcurrenciaIT` falló en 1 de 5 repeticiones con 500. Con dos restricciones `EXCLUDE` (profesional y sillón), dos `INSERT` simultáneos pueden esperarse mutuamente cada uno en una restricción distinta; PostgreSQL detecta el deadlock (`40P01`) y aborta a uno con `CannotAcquireLockException`, que no es `23P01` y terminaba como error interno.
**Decisión**: dentro de la transacción del alta, antes de buscar conflictos, tomar `pg_advisory_xact_lock` por profesional y luego por sillón (siempre en ese orden, `BloqueoAgenda`). Las solicitudes que compiten por los mismos recursos se serializan: la segunda espera, ve el turno ya confirmado y responde `TURNO_SOLAPADO` por el camino normal. Los bloqueos se liberan solos al confirmar o revertir.
**Alternativas**: traducir también `40P01` a solapamiento (descartada: la víctima puede consultar antes de que el ganador confirme y no encontrar el conflicto); nivel `SERIALIZABLE` (descartada: reintentos en toda la API).
**Impacto en la spec**: ninguno; el escenario sigue siendo exactamente una 201 y una 409. Las `EXCLUDE` y la traducción de `23P01` se mantienen como red de seguridad.

### D5 — Error con el turno en conflicto
`TurnoSolapadoException` (409) lleva un resumen `{id, inicio, fin}` del turno en conflicto. `GlobalExceptionHandler` agrega las propiedades extra que declare la excepción: se agrega a `NegocioException` un método `propiedades()` (por defecto vacío) que el handler vuelca en el `ProblemDetail`. Así no se acopla el handler al dominio. Sin datos personales del paciente en el error.

### D6 — API
- `POST /api/turnos` con `CrearTurnoRequest(@NotNull Long pacienteId, @NotNull Long prestacionId, @NotNull OffsetDateTime inicio, @Min(5) @Max(480) Integer duracionMinutos, @Size(max=500) String observaciones)`. `OffsetDateTime` obliga a informar zona (RN-GL-01); se convierte a `Instant`. Responde 201 + `Location`.
- `GET /api/turnos/{id}` → `TurnoResponse(id, inicio, fin, estado, duracionMinutos, paciente{id, nombre, apellido}, prestacion{id, nombre}, profesionalId, sillonId, observaciones)`. Fechas en ISO-8601 con la zona del consultorio.

### D7 — Tests
- Unitarios: `IntervaloTest`, `ReglasAgendaTest` (bordes: justo antes, justo después, contenido, contenedor, igual, adyacentes).
- `TurnoIT` (`@SpringBootTest` + MockMvc + token, reloj mutable `@Primary`): un test por escenario de la spec. El turno cancelado se inserta por `JdbcTemplate` (las transiciones son de C-09).
- `TurnoConcurrenciaIT`: dos hilos con un `CountDownLatch` envían `POST` simultáneos (vía `TestRestTemplate` y puerto real, para que cada uno tenga su propia transacción); se verifica una 201, una 409 y un solo turno en la base. Se repite 5 veces para reducir falsos positivos.
- `TurnoRestriccionesIT` (`@PersistenciaTest`): la base rechaza dos turnos superpuestos insertados por JDBC (prueba la `EXCLUDE` sin pasar por el servicio) y acepta adyacentes.
- `PacienteIT`: `delete from turno` antes de `delete from paciente`.

## Risks / Trade-offs

- [Depende de C-05] → apply bloqueado hasta su merge; los nombres de `Prestacion` se ajustan a lo que implemente Zaira.
- [Test de concurrencia no determinista] → la `EXCLUDE` garantiza el resultado; el test solo verifica que el servicio traduce bien ambos caminos. Se repite para aumentar la probabilidad de carrera real.
- [Un solo profesional y sillón] → la regla por sillón es redundante hoy, pero se especifica y prueba para crecer sin rediseño (RN-AG-02).

## Migration Plan

Aplica `V5` sobre bases con V1–V4 (V3 de C-05 requerida por la FK). Rollback: revertir el PR; `turno` es una tabla nueva.

## Open Questions

- Nombres exactos de `Prestacion` y su repositorio en C-05: se toman de su implementación al hacer apply (no cambia specs ni tareas).
