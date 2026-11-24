## Purpose

Definir el comportamiento de los recordatorios por email
de turnos odontologicos, su trazabilidad y privacidad.

## ADDED Requirements

### Requirement: Seleccion de turnos elegibles

El sistema SHALL seleccionar turnos PROGRAMADO dentro
de la ventana de anticipacion configurada.

#### Scenario: Turno dentro de la ventana

- **GIVEN** un turno programado futuro con email y consentimiento
- **WHEN** se ejecuta la tarea dentro de la ventana
- **THEN** se envia un recordatorio y se registra ENVIADA

#### Scenario: Turno fuera de la ventana

- **WHEN** el turno comienza fuera de la ventana configurada
- **THEN** no se envia un recordatorio

#### Scenario: Turno pasado o no programado

- **WHEN** el turno ya comenzo o no esta PROGRAMADO
- **THEN** no se envia un recordatorio

#### Scenario: Cambio de anticipacion

- **WHEN** cambia la anticipacion configurada
- **THEN** la siguiente ejecucion utiliza el nuevo valor

### Requirement: Consentimiento y email

El sistema SHALL exigir email y consentimiento explicito.

#### Scenario: Paciente sin consentimiento

- **WHEN** aceptaRecordatorios es false
- **THEN** no se envia un recordatorio

#### Scenario: Paciente sin email

- **WHEN** el paciente no tiene email
- **THEN** no se envia un recordatorio

### Requirement: Registro y reintentos

El sistema SHALL registrar el resultado y limitar
a tres intentos totales por ciclo de recordatorio.

#### Scenario: Envio exitoso sin duplicados

- **GIVEN** una notificacion ENVIADA
- **WHEN** se ejecuta nuevamente la tarea
- **THEN** no se realiza otro envio para ese horario

#### Scenario: Fallo y reintento

- **WHEN** falla el transporte
- **THEN** se registra FALLIDA y se incrementan los intentos
- **AND** puede reintentarse en una ejecucion posterior

#### Scenario: Limite de intentos

- **GIVEN** tres intentos fallidos
- **WHEN** se ejecuta nuevamente la tarea
- **THEN** no se realiza un cuarto intento

#### Scenario: Procesamiento concurrente

- **WHEN** dos ejecuciones procesan el mismo turno
- **THEN** no se duplican las notificaciones ni los envios exitosos

### Requirement: Revalidacion previa al envio

El sistema SHALL releer el turno antes de enviar.

#### Scenario: Cancelacion entre consulta y envio

- **GIVEN** un turno seleccionado como candidato
- **WHEN** se cancela antes de su procesamiento
- **THEN** no se envia el recordatorio

### Requirement: Privacidad del mensaje

El mensaje SHALL contener solo fecha, hora,
consultorio y contacto.

#### Scenario: Contenido minimo

- **WHEN** se genera el email
- **THEN** no contiene prestacion ni datos clinicos

### Requirement: Reprogramacion

El sistema SHALL reiniciar la marca de recordatorio
cuando se confirma una reprogramacion.

#### Scenario: Reprogramacion antes del envio

- **WHEN** se reprograma un turno sin recordatorio enviado
- **THEN** se utiliza el nuevo horario

#### Scenario: Reprogramacion despues del envio

- **WHEN** se reprograma un turno con recordatorio ENVIADA
- **THEN** se permite un nuevo recordatorio para el nuevo horario

#### Scenario: Reprogramacion revertida

- **WHEN** la transaccion de reprogramacion se revierte
- **THEN** no se reinicia la marca

### Requirement: Transporte seguro

El transporte SHALL estar deshabilitado por defecto.

#### Scenario: MAIL_ENABLED=false

- **WHEN** el envio esta deshabilitado
- **THEN** no se contacta SMTP ni se registra un envio ficticio

### Requirement: Consulta de notificaciones

El sistema SHALL exponer GET /api/turnos/{id}/notificaciones
mediante DTOs y autenticacion JWT.

#### Scenario: Consulta autenticada

- **WHEN** el odontologo consulta un turno existente
- **THEN** recibe HTTP 200 y su informacion de recordatorio

#### Scenario: Consulta sin autenticacion

- **WHEN** se consulta sin JWT valido
- **THEN** se responde HTTP 401

#### Scenario: Turno inexistente

- **WHEN** se consulta un identificador inexistente
- **THEN** se responde HTTP 404