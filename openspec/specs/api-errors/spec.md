# api-errors Specification

## Purpose

Define un formato único para todas las respuestas de error de la API, de modo que el frontend y los tests puedan reconocer cada error de negocio por un código estable sin depender del texto del mensaje.

## Requirements

### Requirement: Errores en formato Problem Details
Toda respuesta de error de la API (códigos 4xx y 5xx) SHALL tener tipo de contenido `application/problem+json` y un cuerpo con los campos `type`, `title`, `status`, `detail` e `instance`, según RFC 7807.

#### Scenario: Ruta inexistente
- **WHEN** un cliente pide `GET /api/no-existe`
- **THEN** la respuesta tiene estado 404
- **AND** el tipo de contenido es `application/problem+json`
- **AND** el cuerpo incluye `status` igual a 404 y `instance` igual a `/api/no-existe`

### Requirement: Código de negocio en cada error
Todo cuerpo de error SHALL incluir un campo `codigo` con un identificador estable en mayúsculas y guiones bajos. Los errores de negocio usan su propio código (por ejemplo `TURNO_SOLAPADO`); los errores genéricos usan códigos fijos: `RECURSO_NO_ENCONTRADO`, `SOLICITUD_INVALIDA`, `VALIDACION_FALLIDA` y `ERROR_INTERNO`.

#### Scenario: Error de negocio
- **WHEN** una operación de dominio falla por una regla de negocio con código `EJEMPLO_REGLA` y estado 409
- **THEN** la respuesta tiene estado 409
- **AND** el cuerpo incluye `codigo` igual a `EJEMPLO_REGLA`

#### Scenario: Ruta inexistente con código genérico
- **WHEN** un cliente pide una ruta que no existe
- **THEN** el cuerpo incluye `codigo` igual a `RECURSO_NO_ENCONTRADO`

### Requirement: Errores de validación por campo
Cuando la entrada de una solicitud no cumple sus validaciones, la API SHALL responder 422 con `codigo` igual a `VALIDACION_FALLIDA` y un campo `errores` que lista, para cada campo inválido, su nombre y un mensaje.

#### Scenario: Campo obligatorio faltante
- **WHEN** un cliente envía un cuerpo al que le falta un campo obligatorio
- **THEN** la respuesta tiene estado 422
- **AND** `codigo` es `VALIDACION_FALLIDA`
- **AND** `errores` contiene una entrada con el nombre de ese campo

#### Scenario: Cuerpo JSON mal formado
- **WHEN** un cliente envía un cuerpo que no es JSON válido
- **THEN** la respuesta tiene estado 400 con `codigo` igual a `SOLICITUD_INVALIDA`

### Requirement: Errores internos sin detalles sensibles
Ante un error no previsto, la API SHALL responder 500 con `codigo` igual a `ERROR_INTERNO` y un `detail` genérico, sin trazas de pila, nombres de clases, SQL ni datos de pacientes.

#### Scenario: Excepción no controlada
- **WHEN** una operación lanza una excepción inesperada
- **THEN** la respuesta tiene estado 500 y `codigo` `ERROR_INTERNO`
- **AND** el cuerpo no contiene la traza de pila ni el mensaje original de la excepción
