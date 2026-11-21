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

### usuario
- `email` varchar(254), único, no nulo
- `password_hash` varchar(100), no nulo (BCrypt)
- `rol` varchar(30), no nulo, valores: `ODONTOLOGO`
- `activo` boolean, por defecto `true`

### profesional
- `usuario_id` FK → usuario, único
- `nombre` varchar(100), `apellido` varchar(100), `matricula` varchar(30) nulo
- Relación: 1 profesional tiene N turnos

### sillon
- `nombre` varchar(50), único (ej. "Sillón 1")
- `activo` boolean
- Relación: 1 sillón tiene N turnos

### paciente
- `nombre` varchar(100), `apellido` varchar(100), no nulos
- `dni` varchar(10), único, no nulo (solo dígitos)
- `fecha_nacimiento` date, nulo
- `telefono` varchar(30), nulo
- `email` varchar(254), nulo
- `obra_social` varchar(100), nulo (texto libre en el MVP)
- `numero_afiliado` varchar(50), nulo
- `acepta_recordatorios` boolean, por defecto `false`
- `activo` boolean, por defecto `true` (baja lógica)
- Índices: `dni` único; índice sobre `lower(apellido)`, `lower(nombre)` para búsqueda

### prestacion
- `nombre` varchar(100), único, no nulo
- `duracion_minutos` integer, no nulo, `CHECK (duracion_minutos BETWEEN 5 AND 480)`
- `activa` boolean, por defecto `true`

### turno
- `paciente_id` FK → paciente, no nulo
- `profesional_id` FK → profesional, no nulo
- `sillon_id` FK → sillon, no nulo
- `prestacion_id` FK → prestacion, no nulo
- `inicio` timestamptz, no nulo
- `fin` timestamptz, no nulo, `CHECK (fin > inicio)`
- `estado` varchar(20), no nulo: `PROGRAMADO | ATENDIDO | AUSENTE | CANCELADO | CANCELADO_TARDIO`
- `motivo_cancelacion` varchar(255), nulo
- `cancelado_en` timestamptz, nulo
- `observaciones` varchar(500), nulo (no clínicas)
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
- `canal` varchar(10): `EMAIL`
- `tipo` varchar(20): `RECORDATORIO`
- `estado` varchar(10): `ENVIADA | FALLIDA`
- `intentos` integer
- `destinatario` varchar(254)
- `enviada_en` timestamptz, nulo; `error` varchar(500), nulo
- Restricción: único `(turno_id, tipo)` para no duplicar recordatorios

### configuracion (fila única)
- `horas_cancelacion_tardia` integer, por defecto 24, `CHECK (>= 0)`
- `horas_anticipacion_recordatorio` integer, por defecto 24, `CHECK (> 0)`
- `zona_horaria` varchar(50), por defecto `America/Argentina/Buenos_Aires`

## Seed data inicial

Creado por migración Flyway o al arrancar (bootstrap):

- 1 `usuario` + 1 `profesional` a partir de las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` ([08](08_arquitectura_propuesta.md)). Nunca con contraseña fija en el repositorio.
- 1 `sillon`: "Sillón 1".
- 1 fila de `configuracion` con valores por defecto.
- Prestaciones de ejemplo (duraciones orientativas, editables): Consulta/control 30', Limpieza 45', Obturación 45', Extracción 45', Tratamiento de conducto 90'.
- Pacientes: solo ficticios y solo en el perfil `dev`. Nunca datos reales ([RN-DS-01](05_reglas_de_negocio.md)).
