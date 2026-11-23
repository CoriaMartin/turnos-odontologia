# Modelo de Datos

## Dominios

- **Auth**: usuario que accede al sistema.
- **Recursos**: profesional y sillón que ocupa un turno.
- **Pacientes**: datos básicos y de contacto.
- **Prestaciones**: catálogo con duración predeterminada.
- **Agenda**: turnos y sus estados.
- **Notificaciones**: registro de recordatorios enviados.
- **Configuración**: parámetros del consultorio.

## ERD

```
usuario 1──1 profesional
profesional 1──* turno *──1 sillon
paciente    1──* turno *──1 prestacion
turno       1──* notificacion
configuracion (fila única)
```

## Entidades

Todas las fechas y horas se guardan como `timestamptz` (UTC) y se presentan en `America/Argentina/Buenos_Aires`. Todas las tablas tienen `id` (bigint identity), `creado_en` y `actualizado_en`.

**Convención de texto** (decidida en C-03, 2026-11-23): las cadenas se declaran como `text` con `CHECK (length(col) <= n)` en lugar de `varchar(n)`. Mismo límite, pero ampliarlo es solo cambiar el `CHECK`. En JPA se mapean con `@Column(columnDefinition = "text")`. Abajo, `text (≤ n)` indica ese límite.

### usuario
- `email` text (≤ 254), no nulo, único sin distinguir mayúsculas (índice único sobre `lower(email)`)
- `password_hash` text (≤ 100), no nulo (BCrypt)
- `rol` text, no nulo, `CHECK (rol IN ('ODONTOLOGO'))`
- `activo` boolean, por defecto `true`

### profesional
- `usuario_id` FK → usuario, único, `ON DELETE RESTRICT`
- `nombre` text (≤ 100), `apellido` text (≤ 100), `matricula` text (≤ 30) nulo
- Relación: 1 profesional tiene N turnos

### sillon
- `nombre` text (≤ 50), único (ej. "Sillón 1")
- `activo` boolean
- Relación: 1 sillón tiene N turnos

### paciente
- `nombre` text (≤ 100), `apellido` text (≤ 100), no nulos
- `dni` text (≤ 10), único, no nulo (solo dígitos)
- `fecha_nacimiento` date, nulo
- `telefono` text (≤ 30), nulo
- `email` text (≤ 254), nulo
- `obra_social` text (≤ 100), nulo (texto libre en el MVP)
- `numero_afiliado` text (≤ 50), nulo
- `acepta_recordatorios` boolean, por defecto `false`
- `activo` boolean, por defecto `true` (baja lógica)
- Índices: `dni` único; índice sobre `lower(apellido)`, `lower(nombre)` para búsqueda

### prestacion
- `nombre` text (≤ 100), único, no nulo
- `duracion_minutos` integer, no nulo, `CHECK (duracion_minutos BETWEEN 5 AND 480)`
- `activa` boolean, por defecto `true`

### turno
- `paciente_id` FK → paciente, no nulo
- `profesional_id` FK → profesional, no nulo
- `sillon_id` FK → sillon, no nulo
- `prestacion_id` FK → prestacion, no nulo
- `inicio` timestamptz, no nulo
- `fin` timestamptz, no nulo, `CHECK (fin > inicio)`
- `estado` text (≤ 20), no nulo: `PROGRAMADO | ATENDIDO | AUSENTE | CANCELADO | CANCELADO_TARDIO`
- `motivo_cancelacion` text (≤ 255), nulo
- `cancelado_en` timestamptz, nulo
- `observaciones` text (≤ 500), nulo (no clínicas)
- `version` integer (bloqueo optimista)
- **Restricciones de exclusión** (requieren `CREATE EXTENSION btree_gist`):
  ```sql
  EXCLUDE USING gist (profesional_id WITH =, tstzrange(inicio, fin, '[)') WITH &&)
    WHERE (estado IN ('PROGRAMADO','ATENDIDO','AUSENTE'));
  EXCLUDE USING gist (sillon_id WITH =, tstzrange(inicio, fin, '[)') WITH &&)
    WHERE (estado IN ('PROGRAMADO','ATENDIDO','AUSENTE'));
  ```
  El rango `[)` es semiabierto: un turno que empieza cuando otro termina no colisiona ([RN-AG-03](05_reglas_de_negocio.md)).
- Índices: `(inicio)`; `(paciente_id, inicio)`

### notificacion
- `turno_id` FK → turno, no nulo
- `canal` text (≤ 10): `EMAIL`
- `tipo` text (≤ 20): `RECORDATORIO`
- `estado` text (≤ 10): `ENVIADA | FALLIDA`
- `intentos` integer
- `destinatario` text (≤ 254)
- `enviada_en` timestamptz, nulo; `error` text (≤ 500), nulo
- Restricción: único `(turno_id, tipo)` para no duplicar recordatorios

### configuracion (fila única)
- `id` smallint, `CHECK (id = 1)`: garantiza una sola fila
- `horas_cancelacion_tardia` integer, por defecto 24, `CHECK (>= 0)`
- `horas_anticipacion_recordatorio` integer, por defecto 24, `CHECK (> 0)`
- `zona_horaria` text (≤ 50), por defecto `America/Argentina/Buenos_Aires`

## Seed data inicial

Creado por migración Flyway o al arrancar (bootstrap):

- 1 `usuario` + 1 `profesional` a partir de las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` ([08](08_arquitectura_propuesta.md)). Nunca con contraseña fija en el repositorio.
- 1 `sillon`: "Sillón 1".
- 1 fila de `configuracion` con valores por defecto.
- Prestaciones de ejemplo (duraciones orientativas, editables): Consulta/control 30', Limpieza 45', Obturación 45', Extracción 45', Tratamiento de conducto 90'.
- Pacientes: solo ficticios y solo en el perfil `dev`. Nunca datos reales ([RN-DS-01](05_reglas_de_negocio.md)).
