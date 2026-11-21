# Reglas de Negocio

Cada regla tiene un código `RN-{DOMINIO}-{NN}` para trazabilidad desde specs, tests y changes. Origen principal: [discovery/discovery.md](../discovery/discovery.md) §7.

## Dominio: Agenda y turnos (RN-AG)

- **RN-AG-01**: Un profesional no puede tener dos turnos activos cuyos intervalos se superpongan. Son turnos activos los que están en estado `PROGRAMADO`, `ATENDIDO` o `AUSENTE`.
- **RN-AG-02**: Un sillón no puede tener dos turnos activos cuyos intervalos se superpongan. En el MVP hay un único sillón, pero la regla se valida igual para permitir crecer sin rediseño.
- **RN-AG-03**: Los intervalos son semiabiertos `[inicio, fin)`. Un turno que empieza exactamente cuando termina otro no se solapa.
- **RN-AG-04**: Los sobreturnos (turnos superpuestos a propósito) están prohibidos en el MVP. No hay forma de saltear RN-AG-01 ni RN-AG-02.
- **RN-AG-05**: La duración del turno la propone la prestación elegida (`duracion_minutos`). Puede editarse al crear o reprogramar, entre 5 y 480 minutos. `fin = inicio + duración`.
- **RN-AG-06**: No se puede crear ni reprogramar un turno con `inicio` en el pasado respecto de la hora actual del servidor. **Suposición** confirmada como provisoria en el discovery.
- **RN-AG-07**: No hay restricción por horario de atención ni por bloqueos en el MVP: cualquier horario futuro sin solapamiento es válido.
- **RN-AG-08**: Un turno requiere paciente activo, prestación activa, profesional y sillón.
- **RN-AG-09**: La validación de solapamiento se hace en el servicio y además en la base de datos con restricciones de exclusión. Si la base rechaza la operación por concurrencia, la API responde el mismo error de negocio (`TURNO_SOLAPADO`).
- **RN-AG-10**: Los turnos cancelados (`CANCELADO`, `CANCELADO_TARDIO`) no ocupan el horario.

## Dominio: Estados del turno (RN-ES)

- **RN-ES-01**: Todo turno nuevo nace en `PROGRAMADO`.
- **RN-ES-02**: Transiciones válidas:
  - `PROGRAMADO → CANCELADO | CANCELADO_TARDIO` (en cualquier momento antes del inicio).
  - `PROGRAMADO → ATENDIDO | AUSENTE` (solo a partir del `inicio` del turno).
  - Los estados `ATENDIDO`, `AUSENTE`, `CANCELADO` y `CANCELADO_TARDIO` son finales.
- **RN-ES-03**: Solo un turno `PROGRAMADO` con inicio futuro puede reprogramarse. La reprogramación conserva el turno (mismo id) y vuelve a validar RN-AG-01 a RN-AG-06, excluyéndose a sí mismo de la comparación.
- **RN-ES-04**: Una transición no válida responde `TRANSICION_INVALIDA` sin modificar el turno.

## Dominio: Cancelación (RN-CA)

- **RN-CA-01**: Si la cancelación se registra con menos de `horas_cancelacion_tardia` (por defecto 24 h) antes del inicio, el estado es `CANCELADO_TARDIO`; si no, `CANCELADO`.
- **RN-CA-02**: En los dos casos el horario queda liberado inmediatamente (RN-AG-10).
- **RN-CA-03**: Se registra `cancelado_en` y, opcionalmente, un motivo de hasta 255 caracteres.
- **RN-CA-04**: Exactamente en el límite (faltan justo 24 h) la cancelación es `CANCELADO`. Solo "menos de" es tardía.

## Dominio: Pacientes (RN-PA)

- **RN-PA-01**: El DNI es obligatorio, solo dígitos (7 u 8) y único entre pacientes.
- **RN-PA-02**: Nombre y apellido son obligatorios. Teléfono, email y obra social son opcionales.
- **RN-PA-03**: La baja de un paciente es lógica (`activo = false`). Sus turnos históricos se conservan. No se pueden dar turnos nuevos a un paciente inactivo.
- **RN-PA-04**: Si el paciente tiene turnos `PROGRAMADO` futuros, la baja se rechaza hasta que se cancelen.

## Dominio: Prestaciones (RN-PR)

- **RN-PR-01**: El nombre es único y la duración está entre 5 y 480 minutos.
- **RN-PR-02**: Una prestación usada en turnos no se borra; se desactiva. Cambiar la duración no modifica los turnos ya creados.

## Dominio: Recordatorios (RN-RE)

- **RN-RE-01**: Se envía un recordatorio por email a los turnos `PROGRAMADO` cuyo inicio esté dentro de las próximas `horas_anticipacion_recordatorio` (por defecto 24 h).
- **RN-RE-02**: Solo se envía si el paciente tiene email y `acepta_recordatorios = true` ([11](11_cumplimiento_y_datos_sensibles.md)).
- **RN-RE-03**: Se envía como máximo un recordatorio por turno. Si el envío falla se reintenta hasta 3 veces en ejecuciones posteriores y queda registrado como `FALLIDA`.
- **RN-RE-04**: El email contiene solo fecha, hora, nombre del consultorio y forma de contacto. Nunca la prestación ni datos clínicos.
- **RN-RE-05**: Si el turno se reprograma antes de enviarse el recordatorio, se usa el nuevo horario. Si se reprograma después, se permite un nuevo recordatorio (la marca previa se reinicia).

## Dominio: Autenticación (RN-AU)

- **RN-AU-01**: Toda operación excepto el login requiere un JWT válido y no vencido.
- **RN-AU-02**: Las contraseñas se guardan con BCrypt. Nunca se registran en logs.
- **RN-AU-03**: Tras 5 intentos fallidos de login consecutivos se bloquea el acceso por 15 minutos. **Suposición**.

## Dominio: Datos sensibles (RN-DS)

- **RN-DS-01**: Nunca se guardan datos reales de pacientes en el repositorio, los seeds, los tests ni los ejemplos.
- **RN-DS-02**: Ningún secreto (contraseñas, JWT secret, credenciales SMTP) se versiona. Se leen de variables de entorno.
- **RN-DS-03**: Los logs no incluyen DNI, email ni teléfono de pacientes.

## Excepciones globales

- **RN-GL-01**: Toda fecha que recibe la API debe incluir zona horaria (ISO-8601). El sistema opera en `America/Argentina/Buenos_Aires`.
- **RN-GL-02**: Ninguna operación de negocio borra físicamente turnos, pacientes ni notificaciones.
