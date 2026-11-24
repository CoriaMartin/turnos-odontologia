# Design — consultar-agenda (C-08)

## Context

Motivación y alcance: ver `proposal.md`. Requisitos: `specs/turnos/spec.md`.

Estado actual del código (C-07 y C-10 mergeados):

- `TurnoController` (`/api/turnos`) expone `POST`, `GET /{id}` y `PUT /{id}/reprogramacion`.
- `TurnoResponse` ya es el DTO de turno con `PacienteResumen` (id, nombre, apellido) y `PrestacionResumen` (id, nombre), sin DNI ni contacto, con fechas en `RelojConfig.ZONA_CONSULTORIO`.
- `TurnoRepository.buscarConDetalle` usa `join fetch` de paciente y prestación para evitar consultas extra.
- `GlobalExceptionHandler` traduce `NegocioException` (código + estado + `propiedades()`), validación de cuerpo (422 `VALIDACION_FALLIDA` con `errores`) y errores estándar de Spring MVC (400 `SOLICITUD_INVALIDA`).
- La tabla `turno` (V5) tiene índice sobre `(inicio)`; no hace falta migración.

## Goals / Non-Goals

**Goals:**
- Un endpoint de solo lectura, acotado (máx. 31 días) y sin N+1, listo para que C-16 arme las vistas diaria y semanal.
- Mismo formato de turno que `GET /api/turnos/{id}`, para que el frontend use un único tipo.

**Non-Goals:**
- Paginación: el período acotado limita el volumen (un sillón, ~20 turnos/día como máximo realista → < 700 por consulta).
- Filtros por paciente, prestación o estado distintos de "cancelados" (no los pide US-031).
- Cálculo de huecos libres o agrupación por día: lo resuelve el frontend.

## Decisions

### D1 — Semántica del período: superposición con `[desde, hasta)`
Se devuelven los turnos con `inicio < hasta AND fin > desde`, la misma lógica semiabierta de RN-AG-03 e `Intervalo.seSuperponeCon`.
- *Alternativa*: filtrar solo por `inicio ∈ [desde, hasta)`. Descartada: un turno que cruza la medianoche (23:30–00:15) no aparecería en el día siguiente aunque ocupe ese tiempo, y la vista diaria quedaría con un hueco falso.
- La condición `inicio < hasta` aprovecha el índice `(inicio)`; con turnos de 480 min como máximo, el costo de `fin > desde` es despreciable.

### D2 — Filtro de cancelados como conjunto de estados
El servicio arma la colección de estados a consultar (`EstadoTurno.values()` o sin `CANCELADO`/`CANCELADO_TARDIO`) y el repositorio filtra con `t.estado in :estados`. Una sola consulta JPQL, sin ramas ni consultas dinámicas.
- Por defecto `incluirCancelados=true`: US-031 pide mostrar los cancelados distinguidos, así que C-16 los necesita; el filtro queda para usos donde solo importa la ocupación.

### D3 — Una consulta con `join fetch`
Nuevo `TurnoRepository.buscarAgenda(desde, hasta, estados)` con `join fetch t.paciente join fetch t.prestacion`, `order by t.inicio, t.id`. Profesional y sillón solo aportan su id, que Hibernate lee del proxy sin inicializarlo. Se reutiliza `TurnoResponse.de`.

### D4 — Validación del período en el servicio, como error 422 `VALIDACION_FALLIDA`
Los parámetros se declaran opcionales en el controller (`required = false`) y `TurnoService.agenda` los valida al construir el record `PeriodoAgenda` (testeable sin Spring): ambos presentes, `hasta > desde`, `Duration.between(desde, hasta) ≤ 31 días`. Si falla lanza `PeriodoAgendaInvalidoException` (subclase de `NegocioException`, código `VALIDACION_FALLIDA`, 422) cuyo `propiedades()` devuelve `errores` con el mismo formato `{campo, mensaje}` que la validación de cuerpo.
- *Alternativa*: `@RequestParam` obligatorio. Descartada: Spring responde 400 `SOLICITUD_INVALIDA` sin `errores`, y CHANGES.md pide 422 para rango inválido; además el spec `api-errors` define 422 + `errores` para entradas que no cumplen validaciones.
- *Alternativa*: Bean Validation sobre un record de parámetros. Descartada: la regla cruzada (`hasta > desde`, máx. 31 días) igual requiere un validador de clase y agrega más código que la validación directa.
- El límite de 31 días se mide como duración exacta (744 h): `America/Argentina/Buenos_Aires` no tiene horario de verano, así que coincide con días calendario.

### D5 — Formato de fechas: ISO-8601 con zona, mal formado → 400
`desde`/`hasta` se reciben como `OffsetDateTime` con `@DateTimeFormat(iso = DATE_TIME)`. Un valor sin zona o no parseable produce `MethodArgumentTypeMismatchException`, que `ResponseEntityExceptionHandler` ya convierte en 400 y el handler completa con `SOLICITUD_INVALIDA`, en línea con "JSON mal formado → 400".
- El cliente debe codificar el `+` de offsets positivos en la URL (`%2B`); con `-03:00` no aplica, pero C-16 usará `URLSearchParams`, que lo hace solo.

### UI Mockups
- Design system revision: 2 (no aplica)
- Decision: no (no UI) — 2026-11-24
- Mockups: —
- Approval: —
- Preview: —
- Visual verify: —

## Risks / Trade-offs

- [El `@ExceptionHandler(Exception.class)` del handler podría capturar el type mismatch y devolver 500] → Spring elige el handler más específico (`TypeMismatchException` en la clase base); lo cubre el test del escenario "Fecha sin zona horaria".
- [Sin paginación, una consulta de 31 días devuelve todos los turnos] → el volumen está acotado por un único sillón; si en el futuro hay varios profesionales, se revisa en un change nuevo.
- [Turnos de pacientes dados de baja aparecen en la agenda] → es lo esperado (RN-GL-02: no se borra historia); el resumen no expone datos sensibles.
