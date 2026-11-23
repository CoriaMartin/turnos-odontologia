# Decisiones y Supuestos

## Decisiones documentadas

### DD-01 — Segmento: odontólogo independiente
**Decisión**: el MVP apunta a un único odontólogo con un único sillón, que opera el sistema él mismo.
**Contexto**: el informe propone un MVP pensado para clínicas (profesional y recurso, ficha mínima).
**Alternativas consideradas**: consultorio chico con recepción; clínica multisede.
**Justificación**: el alcance cabe en un trabajo integrador y la regla central (no solapamiento) sigue siendo verificable.
**Trade-offs aceptados**: se resigna atender clínicas desde el inicio; se mitiga modelando profesional y sillón como entidades.

### DD-02 — Web app: SPA React + API Spring Boot
**Decisión**: frontend React + TypeScript (Vite) y backend Java 21 + Spring Boot 3.
**Alternativas consideradas**: solo API; Python + FastAPI; Node; Angular; Thymeleaf.
**Justificación**: elección del equipo; experiencia previa con Spring Boot; React es el ecosistema más común.
**Trade-offs aceptados**: dos proyectos y dos toolchains; más trabajo que una API sola. El frontend activa el gate de diseño visual.

### DD-03 — PostgreSQL con restricción de exclusión
**Decisión**: el no solapamiento se valida en el servicio y además con `EXCLUDE USING gist` sobre `tstzrange(inicio, fin, '[)')`.
**Contexto**: el informe constató que ningún competidor demostró concurrencia real (§C.3).
**Alternativas consideradas**: solo validación en la aplicación; bloqueo pesimista; SQLite.
**Justificación**: la base garantiza la invariante aunque fallen o compitan dos transacciones.
**Trade-offs aceptados**: dependencia de PostgreSQL y `btree_gist`; los tests de integración no pueden usar H2.

### DD-04 — Autenticación con JWT y un único rol
**Decisión**: login con contraseña BCrypt y JWT; rol `ODONTOLOGO`.
**Justificación**: los datos de salud son sensibles (Ley 25.326) aunque haya un solo usuario.
**Trade-offs aceptados**: sin refresh token ni recuperación de contraseña en el MVP.

### DD-05 — Email por SMTP real detrás de una interfaz
**Decisión**: `EnviadorEmail` con implementación SMTP configurable por variables de entorno; los tests usan un doble.
**Alternativas consideradas**: Mailpit local; WhatsApp API.
**Justificación**: elección del equipo; sin costo por mensaje.
**Trade-offs aceptados**: riesgo de enviar emails reales por error; se mitiga con `MAIL_ENABLED=false` por defecto y doble en tests.

### DD-06 — Entorno local sin Docker
**Decisión**: cada integrante instala PostgreSQL localmente.
**Alternativas consideradas**: Docker Compose con Testcontainers.
**Justificación**: elección del equipo.
**Trade-offs aceptados**: más fricción al clonar; los tests de integración requieren una base local configurada.

### DD-07 — Carga de turnos solo por el odontólogo
**Decisión**: no hay reserva online del paciente en el MVP.
**Justificación**: reduce estados y concurrencia pública; la reserva online queda como change posterior.

### DD-08 — Sin ficha clínica en el MVP
**Decisión**: solo datos básicos del paciente.
**Justificación**: evita las obligaciones de historia clínica de la Ley 26.529 en la primera versión.

### DD-09 — Sobreturnos prohibidos e intervalos semiabiertos
**Decisión**: no existe forma de superponer turnos; `[inicio, fin)`.
**Justificación**: regla dura, especificable y testeable.

### DD-10 — Cancelación tardía configurable
**Decisión**: menos de 24 h (configurable) antes del inicio = `CANCELADO_TARDIO`; el horario se libera igual.

### DD-11 — Equipo de 4 integrantes
**Decisión**: 4 integrantes, autorizado por la cátedra, con un líder que conduce fundación y OPSX.

### DD-12 — No se permiten turnos en el pasado
**Decisión**: no se puede crear ni reprogramar un turno cuyo inicio sea anterior a la hora actual del servidor ([RN-AG-06](05_reglas_de_negocio.md)); la API responde 422 `TURNO_EN_PASADO`.
**Contexto**: pregunta abierta de prioridad Alta del discovery (antes SU-01) que bloqueaba C-07. Decidida por el equipo el 2026-11-23.
**Alternativas consideradas**: permitir carga retroactiva para registrar turnos ya atendidos.
**Justificación**: la agenda planifica turnos futuros; la regla es simple, verificable y evita estados inconsistentes (un turno nuevo nacería en `PROGRAMADO` con inicio ya vencido).
**Trade-offs aceptados**: no se puede registrar de forma retroactiva un turno atendido sin haberlo cargado antes. Si hiciera falta, se propone como change nuevo.

## Supuestos inferidos

### SU-01 — No se dan turnos en el pasado
**Estado**: resuelto, ahora es la decisión [DD-12](#dd-12--no-se-permiten-turnos-en-el-pasado) (2026-11-23).

### SU-02 — El recordatorio sale 24 h antes
**Origen**: discovery §11.
**Riesgo si es falso**: el email llega demasiado tarde o temprano.
**Cómo validar**: configurable; confirmar valor por defecto con usuarios.

### SU-03 — El paciente debe aceptar explícitamente los recordatorios
**Origen**: Ley 25.326 e informe §C.4.
**Riesgo si es falso**: se envían menos recordatorios de los posibles.
**Cómo validar**: consulta con la cátedra o asesoría legal.

### SU-04 — El email es un canal suficiente
**Origen**: decisión del equipo.
**Riesgo si es falso**: baja tasa de lectura; en Argentina predomina WhatsApp.
**Cómo validar**: medir aperturas o preguntar a pacientes en la demo.

### SU-05 — Bloqueo de login tras 5 intentos durante 15 minutos
**Origen**: práctica de seguridad habitual, no pedida explícitamente.
**Cómo validar**: confirmar en el change de autenticación.

### SU-06 — Duraciones de prestaciones de ejemplo
**Origen**: valores orientativos para el seed (30–90 minutos).
**Riesgo si es falso**: ninguno; son editables.

### SU-07 — Zona horaria única Argentina
**Origen**: mercado argentino.
**Riesgo si es falso**: errores de horario si se usa desde otra zona.
