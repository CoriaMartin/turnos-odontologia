## ADDED Requirements

### Requirement: Consulta de configuración mediante API

El sistema SHALL permitir consultar la configuración vigente
mediante GET /api/configuracion con autenticación JWT.

#### Scenario: Consulta autenticada

- **WHEN** el odontólogo realiza una consulta con JWT válido
- **THEN** el sistema responde HTTP 200 con
  horasCancelacionTardia, horasAnticipacionRecordatorio y zonaHoraria

#### Scenario: Consulta sin autenticación

- **WHEN** se consulta la configuración sin autenticación
- **THEN** el sistema responde HTTP 401

### Requirement: Actualización de configuración mediante API

El sistema SHALL permitir actualizar las horas de cancelación
tardía y anticipación del recordatorio mediante PUT /api/configuracion
con autenticación JWT.

#### Scenario: Actualización válida

- **WHEN** se envían 12 horas de cancelación tardía y 48 horas de recordatorio
- **THEN** el sistema responde HTTP 200 y persiste ambos valores
- **AND** una consulta posterior devuelve los valores actualizados

#### Scenario: Cancelación tardía inválida

- **WHEN** se envían -1 horas de cancelación tardía
- **THEN** el sistema responde HTTP 422
- **AND** conserva los valores anteriores

#### Scenario: Anticipación de recordatorio inválida

- **WHEN** se envían 0 horas de anticipación del recordatorio
- **THEN** el sistema responde HTTP 422
- **AND** conserva los valores anteriores

### Requirement: Conservación de turnos existentes

La actualización de configuración SHALL preservar los registros
de turnos existentes y aplicar los parámetros a operaciones futuras.

#### Scenario: Actualización con un turno existente

- **GIVEN** existe un turno programado
- **WHEN** se actualizan ambos parámetros mediante la API
- **THEN** todos los campos del turno permanecen iguales
- **AND** su estado continúa siendo PROGRAMADO
